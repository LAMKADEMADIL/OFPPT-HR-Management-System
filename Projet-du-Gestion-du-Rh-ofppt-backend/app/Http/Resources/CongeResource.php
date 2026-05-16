<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CongeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idConge,
            'date_debut' => $this->date_debut,
            'date_fin' => $this->date_fin,
            'date_demande' => $this->date_demande,
            'type_conge' => $this->type_conge,
            'statut' => $this->statut,
            'idPersonnel' => $this->idPersonnel,
            'employe' => $this->personnel ? ($this->personnel->nom . ' ' . $this->personnel->prenom) : '—',
            
            'personnel' => new PersonnelResource(
                $this->whenLoaded('personnel')
            ),
        ];
    }
}
