<?php

namespace App\Http\Controllers;

use App\Imports\EmploiTempsImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Throwable;

/**
 * EmploiTempsController
 *
 * Gère l'import de fichiers Excel (.xlsx / .xlsm) pour l'emploi du temps.
 * Route : POST /api/import-emploi
 */
class EmploiTempsController extends Controller
{
    /**
     * Importer un fichier Excel d'emploi du temps.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function import(Request $request): JsonResponse
    {
        // ── Validation ────────────────────────────────────────────────
        $validator = Validator::make($request->all(), [
            'fichier' => [
                'required',
                'file',
                // Accepte xlsx, xls, xlsm et csv
                'mimes:xlsx,xls,xlsm,csv,ods',
                // Taille max 10 Mo
                'max:10240',
            ],
        ], [
            'fichier.required' => 'Veuillez sélectionner un fichier Excel.',
            'fichier.file'     => 'Le fichier uploadé est invalide.',
            'fichier.mimes'    => 'Le fichier doit être au format Excel (.xlsx, .xls, .xlsm) ou CSV.',
            'fichier.max'      => 'Le fichier ne doit pas dépasser 10 Mo.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier invalide.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // ── Import ────────────────────────────────────────────────────
        try {
            $import = new EmploiTempsImport();
            Excel::import($import, $request->file('fichier'));

            $data = $import->getData();

            if ($data->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le fichier ne contient aucune donnée exploitable. '
                               . 'Vérifiez que les colonnes "Matricule" et "Nom et Prénom" sont présentes.',
                ], 422);
            }

            // ── Construire la réponse structurée ──────────────────────
            $formateurs = $data->map(fn($row) => [
                'matricule'     => $row['matricule']     ?? '—',
                'nom_prenom'    => $row['nom_et_prenom'] ?? '—',
                'grade'         => $row['grade']         ?? null,
                'specialite'    => $row['specialite']    ?? null,
                'departement'   => $row['departement']   ?? null,
                'etablissement' => $row['etablissement'] ?? null,
                'creneaux'      => $row['creneaux']      ?? [],
            ]);

            // Colonnes de créneaux détectées (pour affichage dynamique)
            $creneauxColumns = $data
                ->flatMap(fn($row) => array_keys($row['creneaux'] ?? []))
                ->unique()
                ->values()
                ->toArray();

            return response()->json([
                'success'          => true,
                'message'          => sprintf(
                    '%d formateur(s) importé(s) avec succès.',
                    $formateurs->count()
                ),
                'total'            => $formateurs->count(),
                'creneaux_columns' => $creneauxColumns,
                'data'             => $formateurs,
            ]);

        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la lecture du fichier : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retourne un modèle Excel vide à télécharger.
     * Route : GET /api/import-emploi/template
     */
    public function template(): BinaryFileResponse
    {
        // Le fichier modèle est stocké dans storage/app/templates/
        $path = storage_path('app/templates/emploi_du_temps_modele.xlsx');

        if (!file_exists($path)) {
            abort(404, 'Modèle non disponible.');
        }

        return response()->download($path, 'modele_emploi_du_temps.xlsx');
    }
}
