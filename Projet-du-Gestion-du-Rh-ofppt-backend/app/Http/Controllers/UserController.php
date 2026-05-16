<?php

namespace App\Http\Controllers;

use App\Models\User; //plus important
use App\Http\Resources\UserResource;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
         $query = User::with('personnel');

         if($request->filled('name')) {
               $query->where('name','like','%'. $request->name .'%');
         }

         if($request->filled('email')) {
               $query->where('email','like','%'. $request->email .'%');
         }

        if($request->filled('role')) {
               $query->where('role','like','%'. $request->role .'%');
         }

        // secure sorting
        $allowedSorts = ['name','created_at'];

        if ($request->filled('sort_by') && in_array($request->sort_by, $allowedSorts)) {
            $query->orderBy($request->sort_by, $request->order ?? 'asc');
        }
 
         $perPage = request()->per_page ?? 10;

        return UserResource::collection(
            $query->paginate($perPage)
        );  
    }

    /**
     * Store a newly created resource in storage.
     */
    
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();

        //hash password
        $data['password'] = Hash::make($data['password']);
       
        $user = User::create($data);
        
        return new UserResource($user);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
         return new UserResource(
            User::with('personnel')->findOrFail($id)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validated();

        if(isset($data['password'])){
            $data['password'] = Hash::make($data['password']);
        }
 
        $user->update($data);

        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
         User::destroy($id);
        return response()->json(['message'=>'deleted']);
    }
}
