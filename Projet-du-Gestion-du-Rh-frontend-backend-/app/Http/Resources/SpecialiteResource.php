<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpecialiteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idSpecialite,
            'nom_specialite' => $this->nom_specialite,
            'type_specialite' => $this->type_specialite,

            'personnels' => PersonnelResource::collection(
                $this->whenLoaded('personnels')
            ),

            'personnels_count' => $this->whenCounted('personnels'),
        ];
    }
}
