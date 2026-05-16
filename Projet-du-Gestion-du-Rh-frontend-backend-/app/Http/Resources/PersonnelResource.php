<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PersonnelResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idPersonnel,
            'type_personnel' => $this->type_personnel,
            'statut' => $this->statut,
            'cin' => $this->cin,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'date_naissance' => $this->date_naissance,
            'lieu_naissance' => $this->lieu_naissance,
            'situation_familiale' => $this->situation_familiale,
            'nombre_enfant' => $this->nombre_enfant,
            'adresse_actuelle' => $this->adresse_actuelle,
            'telephone' => $this->telephone,
            'grade' => $this->grade,
            'echelon' => $this->echelon,
            'fonction' => $this->fonction,
            
            'etablissement' => new EtablissementResource($this->whenLoaded('etablissement')),

            'conges' => CongeResource::collection($this->whenLoaded('conges')),
            'absences' => AbsenceResource::collection($this->whenLoaded('absences')),
            'diplomes' => DiplomeResource::collection($this->whenLoaded('diplomes')),
            'specialites' => SpecialiteResource::collection($this->whenLoaded('specialites')),

            'conges_count' => $this->whenCounted('conges'),
            'absences_count' => $this->whenCounted('absences'),
        ];
    }
}
