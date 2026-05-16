<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AbsenceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idAbsence,
            'date_absence' => $this->date_absence,
            'motif' => $this->motif,
            'idPersonnel' => $this->idPersonnel,
            'employe' => $this->personnel ? ($this->personnel->nom . ' ' . $this->personnel->prenom) : '—',
            
            'personnel' => new PersonnelResource(
                $this->whenLoaded('personnel')
            ),
        ];
    }
}
