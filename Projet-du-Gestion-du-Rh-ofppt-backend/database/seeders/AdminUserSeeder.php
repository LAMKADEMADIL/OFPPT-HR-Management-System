<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    // 1. Create Establishment first
    $etab = \App\Models\Etablissement::create([
        'idEtab' => 1,
        'nomEtab' => 'ISTA OFPPT',
    ]);

    // 2. Create Personnel
    $personnel = \App\Models\Personnel::create([
        'idPersonnel' => 1,
        'type_personnel' => 'administratif',
        'statut' => 'permanent',
        'CIN' => 'AB123456',
        'nom' => 'El Alaoui',
        'prenom' => 'Mounir',
        'idEtab' => $etab->idEtab,
    ]);

    // 3. Create User
    \App\Models\User::create([
        'email' => 'mounirelalaoui@ofppt.ma',
        'password' => Hash::make('123456'), // Use Hash for login to work!
        'role' => 'directeurducomplexe',
        'idPersonnel' => $personnel->idPersonnel,
    ]);
}
}
