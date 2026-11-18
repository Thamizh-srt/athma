<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Stored score. sub_category_id = null is the TOTAL row. */
class PatientAssessmentResult extends Model
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

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(AssessmentSubCategory::class, 'sub_category_id');
    }
}
