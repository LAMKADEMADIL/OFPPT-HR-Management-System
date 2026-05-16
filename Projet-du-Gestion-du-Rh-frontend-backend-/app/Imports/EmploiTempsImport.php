<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * EmploiTempsImport
 *
 * Lit un fichier .xlsm contenant l'emploi du temps.
 * Prend en charge les colonnes : Matricule, Nom et Prénom,
 * ainsi que les colonnes de créneaux horaires (Lundi matin, etc.)
 *
 * Compatible avec les fichiers .xlsm (Excel avec macros).
 */
class EmploiTempsImport implements ToCollection, WithHeadingRow, WithMultipleSheets
{
    /** @var Collection Données extraites */
    private Collection $data;

    public function __construct()
    {
        $this->data = collect();
    }

    /**
     * Feuille(s) à lire. On lit la première feuille par défaut.
     * Pour lire toutes les feuilles : retourner [SheetName::class]
     */
    public function sheets(): array
    {
        return [
            0 => $this,  // Première feuille (index 0)
        ];
    }

    /**
     * Traite chaque ligne du fichier Excel.
     * WithHeadingRow transforme automatiquement les en-têtes en clés.
     */
    public function collection(Collection $rows): void
    {
        foreach ($rows as $row) {
            // Ignorer les lignes entièrement vides
            $values = $row->filter(fn($v) => !is_null($v) && $v !== '');
            if ($values->isEmpty()) {
                continue;
            }

            // Normaliser les clés (minuscules, sans espaces, sans accents)
            $normalized = [];
            foreach ($row->toArray() as $key => $value) {
                $cleanKey = $this->normalizeKey($key);
                $normalized[$cleanKey] = $value;
            }

            // Extraire les colonnes reconnues
            $entry = [
                'matricule'     => $normalized['matricule'] ?? null,
                'nom_prenom'    => $normalized['nom_et_prenom']
                                ?? $normalized['nom_prenom']
                                ?? $normalized['nomprenom']
                                ?? $normalized['nom']
                                ?? null,
                'grade'         => $normalized['grade']         ?? null,
                'specialite'    => $normalized['specialite']    ?? null,
                'departement'   => $normalized['departement']   ?? null,
                'etablissement' => $normalized['etablissement'] ?? null,
            ];

            // Extraire les créneaux horaires (toutes les colonnes restantes)
            $creneaux = [];
            $joursConnus = [
                'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi',
            ];
            foreach ($normalized as $key => $value) {
                $isCreneaux = array_reduce($joursConnus, fn($carry, $jour) =>
                    $carry || str_contains($key, $jour), false);

                if ($isCreneaux && !empty($value)) {
                    $creneaux[$key] = $value;
                }
            }

            $entry['creneaux'] = $creneaux;

            // N'ajouter que si au moins matricule ou nom_prenom est présent
            if (!empty($entry['matricule']) || !empty($entry['nom_prenom'])) {
                $this->data->push($entry);
            }
        }
    }

    /**
     * Normalise une clé d'en-tête Excel :
     * "Nom et Prénom" → "nom_et_prenom"
     */
    private function normalizeKey(string $key): string
    {
        $key = mb_strtolower($key);
        // Translitération simple des caractères accentués
        $accents = [
            'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a',
            'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'î' => 'i', 'ï' => 'i', 'ì' => 'i', 'í' => 'i',
            'ô' => 'o', 'ö' => 'o', 'ò' => 'o', 'ó' => 'o',
            'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ú' => 'u',
            'ç' => 'c', 'ñ' => 'n',
        ];
        $key = strtr($key, $accents);
        // Remplacer tout ce qui n'est pas alphanumérique par underscore
        $key = preg_replace('/[^a-z0-9]+/', '_', $key);
        return trim($key, '_');
    }

    /** Retourne les données extraites */
    public function getData(): Collection
    {
        return $this->data;
    }
}
