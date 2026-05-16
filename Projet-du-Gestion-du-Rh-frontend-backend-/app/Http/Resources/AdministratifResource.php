<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdministratifResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_personnel' => $this->id_personnel,
            'matricule' => $this->matricule,
            'date_recrutement' => $this->date_recrutement,
            'grade' => $this->grade,
            'echelon' => $this->echelon,
            'fonction' => $this->fonction,
        ];
    }
}
