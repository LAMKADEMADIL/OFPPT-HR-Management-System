<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialite extends Model
{
    protected $primaryKey = 'idSpecialite';

    protected $fillable = ['nom_specialite','type_specialite'];
    
    public function personnels()
    {
        return $this->belongsToMany(
            Personnel::class,
            'enseigner',
            'idSpecialite',
            'idPersonnel'
        );
    }
}
