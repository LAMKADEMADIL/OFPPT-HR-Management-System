<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'idPersonnel' => $this->idPersonnel,
            'matricule' => $this->matricule,
            'formateur' => $this->full_name, // Map full_name to formateur for frontend
            'jour' => (int) $this->jour,
            'heureDebut' => substr($this->heure_debut, 0, 5), // Map heure_debut to heureDebut
            'heureFin' => substr($this->heure_fin, 0, 5),     // Map heure_fin to heureFin
            'module' => $this->module,
            'salle' => $this->salle,
            'groupe' => $this->groupe,
            'type' => $this->type,
            'etablissement' => $this->etablissement,
            'date' => $this->date,
            // Planning fields
            'assignment' => $this->assignment,
            'grade' => $this->grade,
            'echelle' => $this->echelle,
            'startDate' => $this->start_date,
            'endDate' => $this->end_date,
            'daysCount' => $this->days_count,
            'interimStaff' => $this->interim_staff,
        ];
    }
}
