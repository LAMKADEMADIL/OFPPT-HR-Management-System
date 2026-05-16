<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use App\Models\Conge;
use App\Models\Absence;
use App\Models\Diplome;
use App\Models\Specialite;
use App\Models\Etablissement;

class DashboardController extends Controller
{
    public function stats()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                // totals
                'personnels_total' => Personnel::count(),
                'conges_pending' => Conge::where('statut', 'en_attente')->count(),
                'absences_total' => Absence::count(),
                'diplomes_total' => Diplome::count(),
                'specialites_total' => Specialite::count(),
                'etablissements_total' => Etablissement::count(),

                // breakdown
                'personnels_by_type' => [
                    'formateur' => Personnel::where('type_personnel', 'formateur')->count(),
                    'administratif' => Personnel::where('type_personnel', 'administratif')->count(),
                ],

                //  recent activity (optional)
                'latest_conges' => Conge::with('personnel')->latest()->take(5)->get(),
                'latest_absences' => Absence::with('personnel')->latest()->take(5)->get(),
            ]
        ]);
    }
}