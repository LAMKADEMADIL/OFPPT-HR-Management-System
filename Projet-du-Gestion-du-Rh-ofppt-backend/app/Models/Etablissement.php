<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Personnel;

class Etablissement extends Model
{
    protected $table = 'etablissements';
    protected $primaryKey = 'idEtab';

    protected $fillable = [
        'nom',
        'ville'
    ];

    public function personnels()
    {
        return $this->hasMany(Personnel::class, 'idEtab');
    }
}
