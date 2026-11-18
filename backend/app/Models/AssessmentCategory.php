<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** An assessment, e.g. "Brief Emotional Intelligence Scale (BEIS-10)". */
class AssessmentCategory extends Model
{
    // Catalog tables are filled by the seeder only, never from request input.
    protected $guarded = [];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'min_score' => 'integer', 'max_score' => 'integer'];
    }

    public function subCategories(): HasMany
    {
        return $this->hasMany(AssessmentSubCategory::class, 'category_id')->orderBy('sort_order');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(AssessmentQuestion::class, 'category_id')->orderBy('number');
    }

    public function scoreBands(): HasMany
    {
        return $this->hasMany(AssessmentScoreBand::class, 'category_id')->orderBy('sort_order');
    }

    public function patientAssessments(): HasMany
    {
        return $this->hasMany(PatientAssessment::class, 'category_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
