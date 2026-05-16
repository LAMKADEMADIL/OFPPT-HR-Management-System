<?php

namespace App\Http\Controllers;

use App\Models\Seance;
use App\Models\Personnel;
use App\Http\Resources\SeanceResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SeanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Seance::with('personnel');

        if ($request->filled('etablissement')) {
            $query->where('etablissement', $request->etablissement);
        }

        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }

        return SeanceResource::collection($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $this->mapFrontendToBackend($request->all());
        $seance = Seance::create($data);
        return new SeanceResource($seance);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $seance = Seance::findOrFail($id);
        $data = $this->mapFrontendToBackend($request->all());
        $seance->update($data);
        return new SeanceResource($seance);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Seance::destroy($id);
        return response()->json(['message' => 'deleted']);
    }

    private function mapFrontendToBackend($data)
    {
        return [
            'idPersonnel' => $data['idPersonnel'] ?? null,
            'matricule'   => $data['matricule'] ?? null,
            'full_name'   => $data['formateur'] ?? null,
            'jour'        => $data['jour'] ?? null,
            'heure_debut' => $data['heureDebut'] ?? null,
            'heure_fin'   => $data['heureFin'] ?? null,
            'module'      => $data['module'] ?? null,
            'salle'       => $data['salle'] ?? null,
            'groupe'      => $data['groupe'] ?? null,
            'type'        => $data['type'] ?? 'cours',
            'etablissement' => $data['etablissement'] ?? null,
            'date'        => $data['date'] ?? null,
        ];
    }
    public function import(Request $request)
    {
        $request->validate([
            'seances' => 'required|array',
            'type' => 'nullable|string', // 'timetable' or 'planning'
        ]);

        $data = $request->input('seances');
        $importType = $request->input('type', 'timetable');

        \Log::info("Début Import Seances", [
            'total_rows' => count($data),
            'first_row_keys' => isset($data[0]) ? array_keys($data[0]) : 'empty',
            'has_creneaux' => isset($data[0]['creneaux']),
            'sample_row' => $data[0] ?? null,
            'debug_headers' => $request->input('debug_headers')
        ]);

        DB::beginTransaction();
        try {
            $count = 0;
            $skipped = 0;
            $errors = [];

            // Wipe existing sessions to avoid duplicates/conflicts
            // Use delete() instead of truncate() to respect the transaction
            Seance::query()->delete();

            foreach ($data as $index => $row) {
                // 1. Identify Personnel
                $matricule = $row['matricule'] ?? $row['mle'] ?? $row['Matricule'] ?? null;
                $fullName = $row['nom_prenom'] ?? $row['full_name'] ?? $row['formateur'] ?? null;

                $personnel = null;
                if ($matricule) {
                    $personnel = Personnel::where('matricule', trim($matricule))->first();
                }
                
                if (!$personnel && $fullName) {
                    $fullName = trim($fullName);
                    // Try exact match
                    $personnel = Personnel::whereRaw('LOWER(CONCAT(nom, " ", prenom)) = ?', [strtolower($fullName)])
                                ->orWhereRaw('LOWER(CONCAT(prenom, " ", nom)) = ?', [strtolower($fullName)])
                                ->first();

                    if (!$personnel) {
                        // Fuzzy search: try each word
                        $parts = array_filter(explode(' ', $fullName), fn($p) => strlen($p) > 2);
                        if (!empty($parts)) {
                            $q = Personnel::query();
                            foreach($parts as $part) {
                                $q->where(function($query) use ($part) {
                                    $query->where('nom', 'like', "%$part%")
                                          ->orWhere('prenom', 'like', "%$part%");
                                });
                            }
                            $personnel = $q->first();
                        }
                    }
                }

                if (!$personnel) {
                    // AUTO-CREATE Personnel if missing
                    $nameParts = explode(' ', $fullName ?: 'Inconnu Inconnu');
                    $prenom = array_pop($nameParts);
                    $nom = implode(' ', $nameParts) ?: $prenom;
                    
                    $personnel = Personnel::create([
                        'matricule' => $matricule ?: ('AUTO-' . uniqid()),
                        'nom' => strtoupper($nom),
                        'prenom' => ucfirst(strtolower($prenom)),
                        'type' => 'formateur', // Default
                        'statut' => 'permanent'
                    ]);
                    \Log::info("Personnel créé automatiquement: " . ($fullName ?: 'Inconnu'));
                }

                // 2. Process by format
                $isVertical = isset($row['jour']) && isset($row['heure_debut']);
                $isHorizontal = $this->hasDayColumns($row);
                $isPlanning = isset($row['date_debut']) || isset($row['start_date']) || isset($row['date_fin']) || isset($row['type_conge']);

                if ($isVertical) {
                    $this->createVerticalSeance($row, $personnel);
                    $count++;
                } elseif ($isHorizontal) {
                    $added = $this->createHorizontalSeances($row, $personnel);
                    if ($added > 0) {
                        $count += $added;
                    } else {
                        $skipped++;
                    }
                } elseif ($isPlanning) {
                    $this->createPlanningSeance($row, $personnel);
                    $count++;
                } else {
                    if ($index < 3) {
                        \Log::warning("Ligne ignorée (Format inconnu)", ['index' => $index, 'row' => $row]);
                    }
                    $skipped++;
                }
            }

            DB::commit();
            \Log::info("Fin Import Seances", ['processed' => $count, 'skipped' => $skipped]);

            return response()->json([
                'success' => true,
                'message' => "Importation terminée : $count sessions créées, $skipped lignes ignorées.",
                'details' => ['processed' => $count, 'skipped' => $skipped, 'total' => count($data)]
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error("Erreur Import Seances: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => "Erreur d'importation : " . $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    private function hasDayColumns($row)
    {
        $target = isset($row['creneaux']) ? $row['creneaux'] : $row;
        if (!is_array($target)) return false;
        
        $days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        foreach (array_keys($target) as $key) {
            $cleanKey = strtolower($this->stripAccents($key));
            foreach ($days as $day) {
                if (str_contains($cleanKey, $day)) return true;
            }
        }
        return false;
    }

    private function stripAccents($str) {
        return strtr(utf8_decode($str), utf8_decode('àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ'), 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY');
    }

    private function createVerticalSeance($row, $personnel)
    {
        Seance::create([
            'idPersonnel' => $personnel?->idPersonnel,
            'matricule'   => $row['matricule'] ?? $personnel?->matricule,
            'full_name'   => $row['full_name'] ?? $row['nom_prenom'] ?? ($personnel ? $personnel->nom . ' ' . $personnel->prenom : null),
            'jour'        => $row['jour'],
            'heure_debut' => $row['heure_debut'],
            'heure_fin'   => $row['heure_fin'],
            'module'      => $row['module'] ?? null,
            'salle'       => $row['salle'] ?? null,
            'groupe'      => $row['groupe'] ?? null,
            'type'        => $row['type'] ?? 'cours',
            'etablissement' => $row['etablissement'] ?? null,
            'date'        => $row['date'] ?? null,
        ]);
    }

    private function createHorizontalSeances($row, $personnel)
    {
        $target = isset($row['creneaux']) ? $row['creneaux'] : $row;
        $daysMap = ['lundi' => 1, 'mardi' => 2, 'mercredi' => 3, 'jeudi' => 4, 'vendredi' => 5, 'samedi' => 6];
        $count = 0;

        foreach ($target as $key => $value) {
            if (empty($value)) continue;

            foreach ($daysMap as $dayName => $dayNum) {
                if (str_contains(strtolower($key), $dayName)) {
                    $time = $this->extractTimeFromHeader($key);
                    
                    // Garbage filtering (relaxed)
                    $cleanValue = trim((string)$value);
                    $lowValue = mb_strtolower($cleanValue);
                    if (empty($cleanValue) || in_array($lowValue, array_keys($daysMap)) || $lowValue == $dayName) {
                        continue;
                    }

                    if (!$personnel) {
                        // This shouldn't happen here due to the check above, but for safety:
                        continue;
                    }

                    Seance::create([
                        'idPersonnel' => $personnel->idPersonnel,
                        'matricule'   => $row['matricule'] ?? $row['mle'] ?? $personnel->matricule,
                        'full_name'   => $row['full_name'] ?? $row['nom_prenom'] ?? ($personnel->nom . ' ' . $personnel->prenom),
                        'jour'        => $dayNum,
                        'heure_debut' => $time['start'] ?? '08:30',
                        'heure_fin'   => $time['end'] ?? '13:00',
                        'module'      => $cleanValue,
                        'type'        => 'cours',
                        'groupe'      => $row['groupe'] ?? null,
                    ]);
                    $count++;
                }
            }
        }
        return $count;
    }

    private function createPlanningSeance($row, $personnel)
    {
        Seance::create([
            'idPersonnel' => $personnel?->idPersonnel,
            'matricule'   => $row['matricule'] ?? $row['mle'] ?? $personnel?->matricule,
            'full_name'   => $row['full_name'] ?? ($personnel ? $personnel->nom . ' ' . $personnel->prenom : null),
            'start_date'  => $row['date_debut'] ?? $row['start_date'] ?? null,
            'end_date'    => $row['date_fin'] ?? $row['end_date'] ?? null,
            'type'        => $row['type'] ?? 'conge',
            'days_count'  => $row['days_count'] ?? $row['nbre_jours'] ?? null,
        ]);
    }

    private function extractTimeFromHeader($header)
    {
        // Simple regex to find HH:MM
        if (preg_match_all('/([01]\d|2[0-3])[:h][0-5]\d/i', $header, $matches)) {
            return [
                'start' => str_replace('h', ':', $matches[0][0] ?? '08:30'),
                'end'   => str_replace('h', ':', $matches[0][1] ?? '13:00'),
            ];
        }
        return null;
    }
}
