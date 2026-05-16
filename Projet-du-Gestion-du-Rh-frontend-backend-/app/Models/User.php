<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The table associated with the model.
     */
    protected $table = 'users';

    /**
     * Primary key
     */
    protected $primaryKey = 'id';

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'Role',
        'idPersonnel'
    ];

    /**
     * Hidden attributes
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    /**
     * Relation with Personnel
     */
    public function personnel()
    {
        return $this->belongsTo(Personnel::class, 'idPersonnel');
    }
}