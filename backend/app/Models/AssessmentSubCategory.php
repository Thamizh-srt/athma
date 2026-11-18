<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A sub scale, e.g. "Regulation of Own Emotions". */
class AssessmentSubCategory extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['min_score' => 'integer', 'max_score' => 'integer'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssessmentCategory::class, 'category_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(AssessmentQuestion::class, 'sub_category_id')->orderBy('number');
    }
}
