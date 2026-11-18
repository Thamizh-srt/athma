<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientAnswer extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['score' => 'integer'];
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(PatientAssessment::class, 'patient_assessment_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(AssessmentQuestion::class, 'question_id');
    }

    public function option(): BelongsTo
    {
        return $this->belongsTo(AssessmentOption::class, 'option_id');
    }
}
