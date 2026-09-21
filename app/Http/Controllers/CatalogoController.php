<?php

namespace App\Http\Controllers;

use App\Queries\Catalogo\CatalogoIndexQuery;
use App\Services\CatalogoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogoController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Catalogos', [
            'catalogos' => CatalogoIndexQuery::construir(),
        ]);
    }

    public function store(Request $request, string $tipo)
    {
        return CatalogoService::store($request, $tipo);
    }

    public function update(Request $request, string $tipo, string $id)
    {
        return CatalogoService::update($request, $tipo, $id);
    }

    public function destroy(string $tipo, string $id)
    {
        return CatalogoService::destroy($tipo, $id);
    }

    public function reactivar(string $tipo, string $id)
    {
        return CatalogoService::reactivar($tipo, $id);
    }
}
