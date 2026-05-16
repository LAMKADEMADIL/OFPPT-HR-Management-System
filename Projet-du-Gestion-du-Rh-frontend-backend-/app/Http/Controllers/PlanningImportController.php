<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Personnel;
use App\Models\Conge;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PlanningImportController extends Controller
{
    public function importPlanning(Request $request)
    {
        $request->validate([
            'plannings' => 'required|array',
        ]);

        $plannings = $request->input('plannings');
        $successCount = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            foreach ($plannings as $index => $row) {
                // Check if Mle exists
                if (empty($row['mle'])) {
                    $errors[] = "Ligne " . ($index + 1) . " : Matricule (Mle) manquant.";
                    continue;
                }

                // Find the personnel by matricule
                $personnel = Personnel::where('matricule', $row['mle'])->first();

                if (!$personnel) {
                    $errors[] = "Ligne " . ($index + 1) . " : Formateur avec Matricule {$row['mle']} introuvable.";
                    continue;
                }

                // Update creneaux if present in the row
                if (!empty($row['creneaux'])) {
                    $existingCreneaux = $personnel->creneaux ?? [];
                    // Merge new creneaux with existing ones
                    $personnel->creneaux = array_merge($existingCreneaux, $row['creneaux']);
                    $personnel->save();
                }

                // Handle Congés logic
                if (!empty($row['date_debut']) && !empty($row['date_fin'])) {
                    try {
                        $dateDebut = Carbon::parse($row['date_debut'])->format('Y-m-d');
                        $dateFin = Carbon::parse($row['date_fin'])->format('Y-m-d');
                        $typeConge = !empty($row['type_conge']) ? $row['type_conge'] : 'Exceptionnel';

                        Conge::updateOrCreate(
                            [
                                'idPersonnel' => $personnel->idPersonnel,
                                'date_debut' => $dateDebut,
                            ],
                            [
                                'date_fin' => $dateFin,
                                'type_conge' => $typeConge,
                                'statut' => 'approuvé', // Automatically approve imported leaves
                                'date_demande' => now()->format('Y-m-d'),
                            ]
                        );
                    } catch (\Exception $e) {
                        $errors[] = "Ligne " . ($index + 1) . " : Erreur de format de date pour le matricule {$row['mle']}.";
                        continue;
                    }
                }

                $successCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Importation réussie. $successCount enregistrements traités.",
                'errors' => $errors
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'importation : ' . $e->getMessage()
            ], 500);
        }
    }
}
