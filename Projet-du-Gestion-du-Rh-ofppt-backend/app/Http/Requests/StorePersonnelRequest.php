<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePersonnelRequest extends FormRequest
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
              'nom' => 'required|string|max:255',
              'prenom' => 'required|string|max:255',
              'cin' => 'nullable|unique:personnels,cin',
              'type_personnel' => 'required|in:formateur,administratif',
              'statut' => 'required|in:permanent,vacataire',
              'date_naissance' => 'nullable|date',
              'telephone' => 'nullable|string|max:20',
              'idEtab' => 'nullable|exists:etablissements,idEtab',
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
