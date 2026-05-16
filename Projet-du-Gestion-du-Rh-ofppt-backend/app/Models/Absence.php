<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $table = 'absences';
    protected $primaryKey = 'idAbsence';

    protected $fillable = [
        'date_absence',
        'motif',
        'idPersonnel'
    ];

    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'idPersonnel');
    }
}