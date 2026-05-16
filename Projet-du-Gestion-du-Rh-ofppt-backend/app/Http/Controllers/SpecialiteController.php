<?php

namespace App\Http\Controllers;

use App\Models\Specialite;
use App\Http\Resources\SpecialiteResource;
use App\Http\Requests\StoreSpecialiteRequest;
use App\Http\Requests\UpdateSpecialiteRequest;
use Illuminate\Http\Request;

class SpecialiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Specialite::with(['personnels']);

        if ($request->filled('nom_specialite')) {
            $query->where('nom_specialite', 'like', '%' . $request->nom_specialite . '%');
        }

        if ($request->filled('type_specialite')) {
            $query->where('type_specialite', 'like', '%' . $request->type_specialite . '%');
        }

        //  secure sorting
        $allowedSorts = ['nom_specialite','type_specialite','created_at'];
        
        if ($request->filled('sort_by') && in_array($request->sort_by, $allowedSorts)) {
            $query->orderBy($request->sort_by, $request->order ?? 'asc');
        }

        $perPage = $request->per_page ?? 10;

        return SpecialiteResource::collection(
            $query->paginate($perPage)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSpecialiteRequest $request)
    {
        $s = Specialite::create($request->validated());
        return new SpecialiteResource($s);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new SpecialiteResource(
            Specialite::with(['personnels'])->findOrFail($id)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSpecialiteRequest $request, string $id)
    {
        $s = Specialite::findOrFail($id);
        $s->update($request->validated());

        return new SpecialiteResource($s);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Specialite::destroy($id);
        return response()->json(['message'=>'deleted']);
    }
}
