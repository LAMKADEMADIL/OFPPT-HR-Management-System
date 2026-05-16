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
              'cin' => 'required|unique:personnels,cin',
              'type_personnel' => 'required|in:formateur,administratif',
              'statut' => 'required|in:permanent,vacataire',
              'date_naissance' => 'nullable|date',
              'telephone' => 'nullable|string|max:20',
              'idEtab' => 'required|exists:etablissements,idEtab',
              'specialites' => 'nullable|array',
              'specialites.*' => 'exists:specialites,idSpecialite',
              'diplomes' => 'nullable|array',
              'diplomes.*' => 'exists:diplomes,idDiplome'
        ];
    }
}
