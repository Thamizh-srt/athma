<?php

namespace App\Support;

use App\Models\AssessmentScoreBand;
use Illuminate\Support\Collection;

/** Single place that turns a score into its Low / Normal / High band, using the bands currently in the database. */
final class ScoreBandResolver
{
    /**
     * @param  Collection<int, AssessmentScoreBand>  $bands  bands of ONE category
     * @param  int|null  $subId  null = the category total
     */
    public static function find(Collection $bands, ?int $subId, int|float $score): ?AssessmentScoreBand
    {
        return $bands->first(function ($b) use ($subId, $score) {
            $bandSub = $b->sub_category_id === null ? null : (int) $b->sub_category_id;

            return $bandSub === $subId && $score >= $b->min_score && $score <= $b->max_score;
        });
    }
}
