<?php

namespace App\Services;

use App\Models\AssessmentAttempt;
use LogicException;

class AssessmentScoringService
{
    /**
     * @return array{total_score: float|null, dimensions: list<array<string, mixed>>}
     */
    public function calculate(AssessmentAttempt $attempt): array
    {
        $responses = $attempt->responses()->get();
        $dimensions = $attempt->subcategory
            ->scoreDimensions()
            ->with(['questions:id', 'scoreBands'])
            ->get();

        $results = $dimensions->map(function ($dimension) use ($responses): array {
            $questionIds = $dimension->questions->pluck('id');
            $scores = $responses
                ->whereIn('question_id', $questionIds)
                ->pluck('awarded_score')
                ->map(fn ($score) => (float) $score)
                ->values();

            if ($scores->isEmpty()) {
                $score = null;
            } else {
                $score = match ($dimension->aggregation) {
                    'sum' => $scores->sum(),
                    'mean' => $scores->average(),
                    default => throw new LogicException(
                        "Unsupported assessment score aggregation [{$dimension->aggregation}]."
                    ),
                };
                $score = round($score, 3);
            }

            $band = $score === null
                ? null
                : $dimension->scoreBands
                    ->first(fn ($item) => $score >= $item->minimum_score && $score <= $item->maximum_score);

            return [
                'code' => $dimension->code,
                'title' => $dimension->title,
                'score' => $score,
                'aggregation' => $dimension->aggregation,
                'interpretation' => $band ? [
                    'label' => $band->label,
                    'description' => $band->interpretation,
                ] : null,
            ];
        })->values()->all();

        $totalDimension = $dimensions->firstWhere('is_total', true);
        $totalResult = $totalDimension
            ? collect($results)->firstWhere('code', $totalDimension->code)
            : null;
        $totalScore = $totalDimension
            ? ($totalResult['score'] ?? null)
            : null;

        return ['total_score' => $totalScore, 'dimensions' => $results];
    }
}
