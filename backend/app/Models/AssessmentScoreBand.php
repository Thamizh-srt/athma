<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssessmentScoreBand extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['min_score' => 'integer', 'max_score' => 'integer'];
    }
}
