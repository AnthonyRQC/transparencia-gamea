<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DenunciaController extends Controller
{
    public function create()
    {
        return Inertia::render('Denuncias/RegistroDenuncia', [
            'categorias' => DenunciaData::getCategorias(),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'tipo' => 'required|in:corrupcion,negacion,acompaniamiento,intervencion',
            'escenario' => 'required|in:revelada,reservada,anonimo',
            'declaracion_jurada' => 'required|boolean|accepted',
        ];

        if (in_array($request->tipo, ['corrupcion', 'negacion'])) {
            if ($request->escenario !== 'anonimo') {
                $rules = array_merge($rules, [
                    'denunciante.nombres' => 'required|string|min:2|max:100',
                    'denunciante.ci' => 'required|digits_between:6,9',
                    'denunciante.email' => 'required|email',
                    'denunciante.telefono' => 'required|digits:8',
                ]);
            } else {
                $rules = array_merge($rules, [
                    'denunciante.email' => 'nullable|email',
                    'denunciante.telefono' => 'nullable|digits:8',
                ]);
            }

            $rules = array_merge($rules, [
                'denunciados' => 'required|array|min:1',
                'denunciados.*.conoce_identidad' => 'required|boolean',
                'denunciados.*.nombres' => 'required_if:denunciados.*.conoce_identidad,true|nullable|string|max:100',
                'denunciados.*.dependencia' => 'required_if:denunciados.*.conoce_identidad,true|nullable|string|max:200',
                'denunciados.*.descripcion' => 'required_if:denunciados.*.conoce_identidad,false|nullable|string',

                'detalles.categoria' => 'required|string',
                'detalles.fecha' => 'required|date|before_or_equal:today|after_or_equal:' . now()->subYears(5)->format('Y-m-d'),
                'detalles.hora' => 'nullable',
                'detalles.lugar' => 'required|string|max:200',

                'hechos' => 'required|string|min:20|max:5000',

                'pruebas' => 'nullable|array',
                'pruebas.*.tipo' => 'required_with:pruebas.*|in:archivo,fisica,testigo',
                'pruebas.*.descripcion' => 'required_with:pruebas.*|string',
                'pruebas.*.testigo_nombre' => 'required_if:pruebas.*.tipo,testigo|nullable|string|max:100',
                'pruebas.*.testigo_telefono' => 'required_if:pruebas.*.tipo,testigo|nullable|digits:8',
            ]);
        }

        if ($request->tipo === 'acompaniamiento') {
            $rules = array_merge($rules, [
                'nombres' => 'required|string|min:2|max:100',
                'ci' => 'nullable|digits_between:6,9',
                'dependencia_funcionario' => 'required|string|max:200',
                'motivo' => 'required|string|min:20|max:5000',
                'resolucion' => 'required|string|min:10|max:5000',
                'evidencia' => 'nullable',
            ]);
        }

        if ($request->tipo === 'intervencion') {
            $rules = array_merge($rules, [
                'dependencia_observada' => 'required|string|max:200',
                'motivo' => 'required|string|min:20|max:5000',
                'archivo' => 'required',
                'referencia_nota' => 'required|string|max:200',
            ]);
        }

        $validated = $request->validate($rules);

        $ticket = DenunciaData::add($validated);

        return redirect()->back()->with([
            'success' => true,
            'ticket' => $ticket,
        ]);
    }

    public function admitir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'nullable|string|max:500',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede admitir esta denuncia.');
        }

        DenunciaData::admitir($ticket, $validated['justificacion'] ?? null);

        return redirect()->back()->with('success', "Denuncia {$ticket} admitida correctamente.");
    }

    public function rechazar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:10|max:2000',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede rechazar esta denuncia.');
        }

        DenunciaData::rechazar($ticket, $validated['justificacion']);

        return redirect()->back()->with('success', "Denuncia {$ticket} rechazada.");
    }

    public function iniciarInvestigacion(string $ticket)
    {
        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'asignada') {
            return redirect()->back()->with('error', 'No se puede iniciar investigación.');
        }

        DenunciaData::iniciarInvestigacion($ticket);

        return redirect()->back()->with('success', "Investigación iniciada para {$ticket}.");
    }
}
