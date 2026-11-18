<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssessmentQuestion extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return ['number' => 'integer'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AssessmentCategory::class, 'category_id');
    }

    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(AssessmentSubCategory::class, 'sub_category_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(AssessmentOption::class, 'question_id')->orderBy('sort_order');
    }
}
