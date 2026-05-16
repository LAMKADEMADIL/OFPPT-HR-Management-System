<?php

namespace App\Http\Controllers;

use App\Models\Diplome;
use App\Http\Resources\DiplomeResource;
use App\Http\Requests\StoreDiplomeRequest;
use App\Http\Requests\UpdateDiplomeRequest;
use Illuminate\Http\Request;

class DiplomeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Diplome::with('personnels');

        if ($request->filled('nom_diplome')) {
            $query->where('nom_diplome', 'like', '%' . $request->nom_diplome . '%');
        }

        // 🔐 secure sorting
        $allowedSorts = ['nom_diplome','created_at'];
        if ($request->filled('sort_by') && in_array($request->sort_by, $allowedSorts)) {
            $query->orderBy($request->sort_by, $request->order ?? 'asc');
        }

        $perPage = $request->per_page ?? 10;

        return DiplomeResource::collection(
            $query->paginate($perPage)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDiplomeRequest $request)
    {
        $d = Diplome::create($request->validated());
        return new DiplomeResource($d);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return new DiplomeResource(
            Diplome::with('personnels')->findOrFail($id)
        );
    }

    /**
     * Update the specified resource in storage.
     */
     public function update(UpdateDiplomeRequest $request, string $id)
    {
        $d = Diplome::findOrFail($id);
        $d->update($request->validated());

        return new DiplomeResource($d);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
         Diplome::destroy($id);
        return response()->json(['message'=>'deleted']);
    }
}
