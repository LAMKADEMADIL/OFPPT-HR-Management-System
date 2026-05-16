<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Etablissement; //plus important
use App\Http\Resources\EtablissementResource;
use App\Http\Requests\StoreEtablissementRequest;
use App\Http\Requests\UpdateEtablissementRequest;

class EtablissementController extends Controller
{
    /** 
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Etablissement::query();

        if($request->filled('nom')){
            $query->where('nom', 'like', '%' . $request->nom .'%');
        }

        if($request->filled('ville')){
            $query->where('ville', 'like', '%' . $request->ville .'%');
        }
     
        //secure sorting
        $allowedSorts = ['nom','ville','created_at'];

        if ($request->filled('sort_by') && in_array($request->sort_by, $allowedSorts)) {
            $query->orderBy($request->sort_by, $request->order ?? 'asc');
        }
        
        $perPage = request()->per_page ?? 10;

        return EtablissementResource::collection(
             $query->paginate($perPage)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEtablissementRequest $request)
    {
        $e = Etablissement::create($request->validated());

        return new EtablissementResource($e);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return new EtablissementResource(
            Etablissement::with('personnels')->findOrFail($id)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEtablissementRequest $request, $id)
    {
        $e = Etablissement::findOrFail($id);
        $e->update($request->validated());

        return new EtablissementResource($e);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Etablissement::destroy($id);
        return response()->json(['message'=>'deleted']);
    }
}
