<?php

namespace App\Http\Controllers;

use App\Models\Denuncia;
use App\Models\DenunciaArchivo;
use App\Services\CasoAuth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ArchivosCasoController extends Controller
{
    public function listar(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        $archivos = $denuncia->archivos()->activos()->latest('fecha_subida')->get();

        return response()->json($archivos);
    }

    public function subir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'archivo' => 'required|file|mimes:pdf,jpg,jpeg,png,docx|max:51200',
            'nombre' => 'required|string|min:1|max:200',
            'descripcion' => 'nullable|string|max:500',
            'contexto' => 'required|in:registro,general,solicitud,descargo,informe,cierre',
            'contexto_id' => 'nullable|integer|min:1',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (! CasoAuth::puedeOperar($request->user(), $denuncia, 'archivo.subir')) {
            return redirect()->back()->with('error', 'NO TIENES PERMISO PARA OPERAR ESTE CASO.');
        }

        $file = $request->file('archivo');
        $path = $file->store("archivos/{$ticket}", 'local');

        $archivo = $denuncia->archivos()->create([
            'usuario_id' => Auth::id(),
            'nombre' => $validated['nombre'],
            'path' => $path,
            'tamano' => (string) $file->getSize(),
            'mime_type' => $file->getClientMimeType(),
            'descripcion' => $validated['descripcion'] ?? '',
            'contexto' => $validated['contexto'],
            'contexto_entidad_id' => $validated['contexto_id'] ?? null,
            'fecha_subida' => now(),
        ]);

        return redirect()->back()->with('success', "Archivo '{$validated['nombre']}' subido correctamente.");
    }

    public function eliminar(int $id)
    {
        $archivo = DenunciaArchivo::findOrFail($id);

        if (! CasoAuth::puedeOperar(Auth::user(), $archivo->denuncia, 'archivo.eliminar')) {
            return redirect()->back()->with('error', 'NO TIENES PERMISO PARA OPERAR ESTE CASO.');
        }

        $archivo->update(['fecha_eliminacion' => now()]);

        return redirect()->back()->with('success', "Archivo '{$archivo->nombre}' eliminado correctamente.");
    }

    public function download(int $id)
    {
        $archivo = DenunciaArchivo::activos()->findOrFail($id);

        if (! CasoAuth::puedeOperar(Auth::user(), $archivo->denuncia, 'archivo.ver')) {
            return redirect()->back()->with('error', 'NO TIENES PERMISO PARA OPERAR ESTE CASO.');
        }

        if (!Storage::disk('local')->exists($archivo->path)) {
            return redirect()->back()->with('error', 'Archivo no encontrado en el almacenamiento.');
        }

        return Storage::disk('local')->download($archivo->path, $archivo->nombre);
    }
}
