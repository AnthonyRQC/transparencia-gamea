<?php

namespace App\Http\Controllers;

use App\Data\ArchivoData;
use App\Data\DenunciaData;
use Illuminate\Http\Request;

class ArchivosCasoController extends Controller
{
    public function listar(string $ticket)
    {
        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia) {
            return response()->json(['error' => 'Denuncia no encontrada.'], 404);
        }

        $archivos = ArchivoData::getByDenuncia($ticket);

        return response()->json($archivos);
    }

    public function subir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|min:1|max:200',
            'descripcion' => 'nullable|string|max:500',
            'contexto' => 'required|in:general,informe,cierre',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia) {
            return redirect()->back()->with('error', 'Denuncia no encontrada.');
        }

        ArchivoData::add(
            $ticket,
            $validated['nombre'],
            $validated['descripcion'] ?? '',
            $validated['contexto']
        );

        return redirect()->back()->with('success', "Archivo '{$validated['nombre']}' subido correctamente.");
    }

    public function eliminar(int $id)
    {
        $archivo = ArchivoData::find($id);
        if (!$archivo) {
            return redirect()->back()->with('error', 'Archivo no encontrado.');
        }

        ArchivoData::softDelete($id);

        return redirect()->back()->with('success', "Archivo '{$archivo['nombre']}' eliminado correctamente.");
    }
}
