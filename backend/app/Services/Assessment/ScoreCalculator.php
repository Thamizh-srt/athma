<?php

namespace App\Services\Assessment;

/**
 * Pure scoring: sums answer scores per sub category (+ total) and looks up the band.
 * No database access, so it is trivial to unit test.
 */
final class ScoreCalculator
{
    /**
     * @param  list<array{sub_category_id: int|null, score: int}>  $answers
     * @param  list<int>  $subCategoryIds  sub categories to report, in display order
     * @param  list<array{sub_category_id: int|null, min_score: int, max_score: int, label: string, level: string, interpretation?: string|null}>  $bands
     * @param  string  $totalMode  'sum' adds a TOTAL row (sub_category_id = null); 'none' does not
     * @return list<array{sub_category_id: int|null, score: int, label: string|null, level: string|null, interpretation: string|null}>
     */
    public function calculate(array $answers, array $subCategoryIds, array $bands, string $totalMode = 'sum'): array
    {
        $sums = array_fill_keys($subCategoryIds, 0);
        $total = 0;

        foreach ($answers as $answer) {
            $total += $answer['score'];
            $sub = $answer['sub_category_id'];
            if ($sub !== null && array_key_exists($sub, $sums)) {
                $sums[$sub] += $answer['score'];
            }
        }

        $rows = [];
        foreach ($sums as $subId => $score) {
            $rows[] = $this->row($subId, $score, $bands);
        }
        if ($totalMode === 'sum') {
            $rows[] = $this->row(null, $total, $bands);
        }

        return $rows;
    }

    private function row(?int $subId, int $score, array $bands): array
    {
        foreach ($bands as $band) {
            if ($band['sub_category_id'] === $subId && $score >= $band['min_score'] && $score <= $band['max_score']) {
                return [
                    'sub_category_id' => $subId,
                    'score' => $score,
                    'label' => $band['label'],
                    'level' => $band['level'],
                    'interpretation' => $band['interpretation'] ?? null,
                ];
            }
        }

        return ['sub_category_id' => $subId, 'score' => $score, 'label' => null, 'level' => null, 'interpretation' => null];
    }
}
