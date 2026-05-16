<?php

namespace App\Http\Controllers;
 
use App\Models\Absence; //plus important
use App\Http\Resources\AbsenceResource;
use App\Http\Requests\StoreAbsenceRequest;
use App\Http\Requests\UpdateAbsenceRequest;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        /// GET /api/model
        $query = Absence::with('personnel');
 
        ///filters 
        if ($request->filled('motif')) {
            $query->where('motif','like','%'.$request->motif.'%');
        }

        if ($request->filled('date_absence')) {
            $query->where('date_absence', $request->date_absence);
        }

        //secure sorting
        $allowedSorts = ['date_absence','created_at'];

        if ($request->filled('sort_by') && in_array($request->sort_by, $allowedSorts)) {
            $query->orderBy($request->sort_by, $request->order ?? 'asc');
        }

        $perPage = $request->per_page ?? 10;

        return AbsenceResource::collection(
             $query->paginate($perPage)
        );
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/model
     */
    public function store(StoreAbsenceRequest $request)
    {
        $a = Absence::create($request->validated());

        return new AbsenceResource($a);
    }
    /**
     * Display the specified resource.
     * GET /api/model/{id}  (id= 12 ou 1 ou 8 ...)
     */
    public function show(string $id)
    {
        return new AbsenceResource(
            Absence::with('personnel')->findOrFail($id)
        );
    }

    /**
     * Update the specified resource in storage.
     * PUT ou PATCH /api/model/{id}
     */
    public function update(UpdateAbsenceRequest $request, string $id)
    {
        $a = Absence::findOrFail($id);
        $a->update($request->validated());

        return new AbsenceResource($a);
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/model/{id}
     */
    public function destroy(string $id)
    {
        Absence::destroy($id);
        return response()->json(['message'=>'deleted']);
    }
}
