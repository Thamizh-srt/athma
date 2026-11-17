<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Patient extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'full_name', 'age', 'gender', 'phone', 'email', 'address', 'city',
        'state', 'pincode', 'location', 'marital_status', 'education',
        'occupation', 'referred_by', 'password', 'consent', 'consented_at',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'consent' => 'boolean', 'consented_at' => 'datetime'];
    }
}