<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** One patient's attempt at one assessment. */
class PatientAssessment extends Model
{
    public const IN_PROGRESS = 'in_progress';
    public const COMPLETED = 'completed';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['started_at' => 'datetime', 'completed_at' => 'datetime'];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssessmentCategory::class, 'category_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(PatientAnswer::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(PatientAssessmentResult::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === self::COMPLETED;
    }
}
