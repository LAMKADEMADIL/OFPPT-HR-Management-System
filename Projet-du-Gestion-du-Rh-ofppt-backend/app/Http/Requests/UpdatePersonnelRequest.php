<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePersonnelRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'cin' => 'sometimes|string|max:20',
            'idEtab' => 'sometimes|nullable|exists:etablissements,idEtab',
            'specialites' => 'nullable|array',
            'specialites.*' => 'exists:specialites,idSpecialite',
            'diplomes' => 'nullable|array',
            'diplomes.*' => 'exists:diplomes,idDiplome',
            
            // Extra fields present in the database / frontend form
            'matricule' => 'nullable|string|max:255',
            'grade' => 'nullable|string|max:255',
            'fonction' => 'nullable|string|max:255',
            'poste' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'specialite' => 'nullable|string|max:255',
            'echelon' => 'nullable|string|max:255',
            'situation_familiale' => 'nullable|string|max:255',
            'lieu_naissance' => 'nullable|string|max:255',
            'nombre_enfant' => 'nullable|integer',
        ];
    }
}
