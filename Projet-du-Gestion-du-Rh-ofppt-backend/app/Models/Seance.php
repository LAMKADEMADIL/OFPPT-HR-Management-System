<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seance extends Model
{
    use HasFactory;

    protected $fillable = [
        'idPersonnel',
        'matricule',
        'full_name',
        'jour',
        'heure_debut',
        'heure_fin',
        'module',
        'salle',
        'groupe',
        'type',
        'etablissement',
        'date',
        // Planning fields
        'assignment',
        'grade',
        'echelle',
        'start_date',
        'end_date',
        'days_count',
        'interim_staff',
    ];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'idPersonnel');
    }
}
