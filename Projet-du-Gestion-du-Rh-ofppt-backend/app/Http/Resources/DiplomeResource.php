<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiplomeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idDiplome,
            'nom_diplome' => $this->nom_diplome,

            'personnels' => PersonnelResource::collection(
                $this->whenLoaded('personnels')
            ),

            'personnels_count' => $this->whenCounted('personnels'),
        ];
    
    }
}
