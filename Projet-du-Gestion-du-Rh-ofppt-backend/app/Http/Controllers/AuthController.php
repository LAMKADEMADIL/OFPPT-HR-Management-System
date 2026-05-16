<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponds;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponds;

    // LOGIN
    public function login(Request $request)
    {
        \Log::info('Login attempt hit', $request->only('email'));
        $request->validate([
           'email' => 'required|email',
           'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->error('Invalid credentials', 401);
        }
        
        // Revoke all previous tokens
        $user->tokens()->delete();
        
        //token generation
        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user' => $user,
            'access_token' => $token
        ], 'Login successful');
    }
    
    // REGISTER
    public function register(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Register method hit', $request->all());
        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
            'Role' => 'nullable|in:directeur du complexe,gestionnaire CFMR',
            'idPersonnel' => 'nullable|exists:personnels,idPersonnel'
        ]);

        if (!isset($validated['Role'])) {
            $validated['Role'] = 'gestionnaire CFMR';
        }

        // Remove password_confirmation — not a DB column, and prevents double-hash issues
        unset($validated['password_confirmation']);

        $user = User::create($validated);

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->success([
            'user' => $user,
            'access_token' => $token
        ], 'User registered', 201);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully');
    }
}