<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AbsenceSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('absences')->insert([
            [
                'date_absence' => '2026-04-01',
                'motif' => 'maladie',
                'idPersonnel' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'date_absence' => '2026-04-10',
                'motif' => 'congé',
                'idPersonnel' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'date_absence' => '2026-04-15',
                'motif' => 'absence injustifiée',
                'idPersonnel' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}