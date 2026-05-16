<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Personnel;
use App\Models\Specialite;

class PersonnelSeeder extends Seeder
{
    public function run(): void
    {
        $personnels = [
            [
                'cin' => 'AA12345',
                'nom' => 'Amine',
                'prenom' => 'Test',
                'type_personnel' => 'formateur',
                'statut' => 'permanent',
                'date_naissance' => '1995-01-01',
                'lieu_naissance' => 'Casablanca',
                'situation_familiale' => 'single',
                'nombre_enfant' => 0,
                'adresse_actuelle' => 'Casablanca',
                'grade' => 'Senior',
                'echelon' => 3,
                'fonction' => 'Developer',
                'telephone' => '0600000000',
                'idEtab' => 1,
                'specialites' => ['Développement Digital', 'Gestion Entreprise']
            ],
            [
                'cin' => 'BB67890',
                'nom' => 'Sara',
                'prenom' => 'Ali',
                'type_personnel' => 'formateur',
                'statut' => 'vacataire',
                'date_naissance' => '2000-01-01',
                'lieu_naissance' => 'Rabat',
                'situation_familiale' => 'single',
                'nombre_enfant' => 0,
                'adresse_actuelle' => 'Rabat',
                'grade' => 'Junior',
                'echelon' => 2,
                'fonction' => 'Developer',
                'telephone' => '0700000000',
                'idEtab' => 2,
                'specialites' => ['Infrastructure Digitale']
            ],
        ];

        foreach ($personnels as $data) {

            $specialites = $data['specialites'];
            unset($data['specialites']);

            $personnel = Personnel::updateOrCreate(
                ['cin' => $data['cin']],
                $data
            );

            // 🔗 attach relations
            $specIds = Specialite::whereIn('nom', $specialites)->pluck('id')->toArray();

            $personnel->specialites()->sync($specIds);
        }
    }
}