<?php

namespace App\Http\Controllers;

use App\Data\SesionUsuarioData;
use Illuminate\Http\Request;

class SelectorUsuarioController extends Controller
{
    public function cambiar(Request $request)
    {
        $validated = $request->validate([
            'usuario_id' => 'required|string|in:' . implode(',', array_keys(SesionUsuarioData::USUARIOS)),
        ]);

        SesionUsuarioData::switchTo($validated['usuario_id']);
        $usuario = SesionUsuarioData::getCurrent();

        return redirect()->back()->with('success', "Cambiaste a {$usuario['nombre']} ({$usuario['rol_label']})");
    }
}
