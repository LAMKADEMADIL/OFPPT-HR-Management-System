<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conge extends Model
{
    protected $table = 'conges';
    protected $primaryKey = 'idConge';

    protected $fillable = [
        'date_debut',
        'date_fin',
        'date_demande',
        'type_conge',
        'statut',
        'idPersonnel'
    ];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'idPersonnel');
    }
}
