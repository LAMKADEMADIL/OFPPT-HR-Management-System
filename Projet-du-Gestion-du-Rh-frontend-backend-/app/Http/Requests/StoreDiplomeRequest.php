<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDiplomeRequest extends FormRequest
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
            'nom_diplome' => 'required|string|max:255|unique:diplomes,nom_diplome',
        ];
    }

     public function messages(): array
    {
        return [
            'nom_diplome.required' => 'Le nom du diplôme est obligatoire',
           /* 'nom_diplome.unique' => 'Ce diplôme existe déjà',*/
        ];
    }
}
