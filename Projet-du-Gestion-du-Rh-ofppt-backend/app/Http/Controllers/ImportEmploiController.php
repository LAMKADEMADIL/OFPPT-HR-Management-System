<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\Personnel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportEmploiController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'fichier' => 'required|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            // Charger le fichier en collection
            $rows = Excel::toCollection(collect(), $request->file('fichier'))->first();

            if ($rows->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'Le fichier est vide.'], 400);
            }

            // 1. Extraire l'en-tête (première ligne)
            $headers = $rows->first()->toArray();
            
            // 2. Identifier les index des colonnes clés
            $indexMatricule = $this->findColumnIndex($headers, ['matricule', 'mle']);
            $indexNom = $this->findColumnIndex($headers, ['nom', 'prenom', 'formateur']);
            
            if ($indexMatricule === null) {
                return response()->json(['success' => false, 'message' => 'Colonne "Matricule" introuvable.'], 422);
            }

            $formateursData = [];

            // 3. Parcourir les données (sauter l'en-tête)
            foreach ($rows->slice(1) as $row) {
                $rowData = $row->toArray();
                $matricule = trim($rowData[$indexMatricule] ?? '');

                if (empty($matricule)) continue;

                $creneaux = [];
                // Détecter dynamiquement les colonnes de jours (Lundi, Mardi...)
                foreach ($headers as $idx => $header) {
                    if ($this->isDayColumn($header)) {
                        $value = $rowData[$idx] ?? null;
                        if (!empty($value)) {
                            // On normalise la clé (ex: Lundi_M1)
                            $key = Str::slug($header, '_');
                            $creneaux[$key] = $value;
                        }
                    }
                }

                // 4. Mise à jour ou Création dans la base de données
                // On utilise updateOrCreate pour ne pas avoir de doublons
                $personnel = Personnel::updateOrCreate(
                    ['matricule' => $matricule],
                    [
                        'nom_prenom' => $rowData[$indexNom] ?? 'Inconnu',
                        'creneaux' => $creneaux, // Assurez-vous que le cast 'array' est mis dans le modèle Personnel
                        'type' => 'formateur',
                        'type_personnel' => 'formateur'
                    ]
                );

                $formateursData[] = [
                    'matricule' => $personnel->matricule,
                    'nom_prenom' => $personnel->nom_prenom,
                    'creneaux' => $creneaux,
                    'specialite' => $personnel->specialite?->nom_specialite ?? 'N/A'
                ];
            }

            return response()->json([
                'success' => true,
                'message' => count($formateursData) . ' formateurs traités avec succès.',
                'data' => $formateursData,
                'creneaux_columns' => array_values(array_filter($headers, fn($h) => $this->isDayColumn($h)))
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Erreur technique : ' . $e->getMessage()
            ], 500);
        }
    }

    // Helper pour trouver l'index d'une colonne par nom
    private function findColumnIndex($headers, $keywords)
    {
        foreach ($headers as $index => $header) {
            $header = strtolower(Str::ascii($header));
            foreach ($keywords as $word) {
                if (str_contains($header, $word)) return $index;
            }
        }
        return null;
    }

    // Helper pour détecter si une colonne concerne un jour de la semaine
    private function isDayColumn($header)
    {
        $days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        $header = strtolower(Str::ascii($header));
        foreach ($days as $day) {
            if (str_contains($header, $day)) return true;
        }
        return false;
    }
}