<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Etablissement;
use App\Models\Diplome;
use App\Models\Specialite;
use App\Models\Absence;
use App\Models\Conge;

class Personnel extends Model
{
    protected $table = 'personnels';
    protected $primaryKey = 'idPersonnel';

    protected $fillable = [
        'matricule',
        'nom_prenom',
        'creneaux',
        'type',
        'cin',
        'nom',
        'prenom',
        'type_personnel',
        'statut',
        'date_naissance',
        'situation_familiale',
        'adresse_actuelle',
        'telephone',
        'grade',
        'echelon',
        'fonction',
        'contact_nom',
        'contact_telephone',
        'idEtab',
        'idSpecialite'
    ];

    protected $casts = [
        'creneaux' => 'array',
    ];

    public function etablissement()
    {
        return $this->belongsTo(Etablissement::class, 'idEtab');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'idPersonnel');
    }

    public function absences()
    {
        return $this->hasMany(Absence::class, 'idPersonnel');
    }

    public function conges()
    {
        return $this->hasMany(Conge::class, 'idPersonnel');
    }

      public function specialite()
    {
        return $this->belongsTo(Specialite::class, 'idSpecialite');
    }

    public function diplomes()
    {
        return $this->belongsToMany(Diplome::class, 'obtenir', 'idPersonnel', 'idDiplome');
    }

    public function specialites()
    {
        return $this->belongsToMany(Specialite::class, 'enseigner', 'idPersonnel', 'idSpecialite');
    } 

}
