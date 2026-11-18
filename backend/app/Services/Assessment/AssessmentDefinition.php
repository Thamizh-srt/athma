<?php

namespace App\Services\Assessment;

use InvalidArgumentException;

/**
 * Turns one database/data/assessments/*.json file into fully resolved rows
 * (option scores, ranges, bands). Pure PHP so the seeder and the unit tests share it.
 *
 * Option score rules, per question:
 *   1. "scores": [..]  explicit score for each option, in option order   (GDS yes/no)
 *   2. "reverse": true  score = min(value) + max(value) - value            (BFI, MHI)
 *   3. otherwise        score = value
 */
final class AssessmentDefinition
{
    public static function resolve(array $def): array
    {
        $sets = $def['option_sets'] ?? [];
        $defaultType = $def['question_type'] ?? 'choice';
        $totalMode = $def['total_mode'] ?? 'sum';

        $subs = [];
        foreach (array_values($def['sub_categories'] ?? []) as $i => $s) {
            $subs[$s['code']] = [
                'code' => $s['code'],
                'name' => $s['name'],
                'name_ta' => $s['name_ta'] ?? null,
                'description' => $s['description'] ?? null,
                'sort_order' => $i + 1,
                'min_score' => 0,
                'max_score' => 0,
            ];
        }

        $questions = [];
        $catMin = 0;
        $catMax = 0;
        foreach ($def['questions'] as $q) {
            $options = is_string($q['options'])
                ? ($sets[$q['options']] ?? throw new InvalidArgumentException("Unknown option set '{$q['options']}'"))
                : $q['options'];

            $values = array_column($options, 'value');
            $lo = min($values);
            $hi = max($values);
            $flags = $q['flag_values'] ?? [];

            $resolved = [];
            foreach (array_values($options) as $i => $o) {
                $score = $q['scores'][$i] ?? (! empty($q['reverse']) ? $lo + $hi - $o['value'] : $o['value']);
                $resolved[] = [
                    'value' => $o['value'],
                    'label' => $o['label'],
                    'label_ta' => $o['label_ta'] ?? null,
                    'score' => $score,
                    'is_flagged' => in_array($o['value'], $flags, true),
                    'sort_order' => $i + 1,
                ];
            }

            $scores = array_column($resolved, 'score');
            $qMin = min($scores);
            $qMax = max($scores);
            $sub = $q['sub_category'] ?? null;

            if ($sub !== null) {
                if (! isset($subs[$sub])) {
                    throw new InvalidArgumentException("Question {$q['number']} uses unknown sub category '{$sub}'");
                }
                $subs[$sub]['min_score'] += $qMin;
                $subs[$sub]['max_score'] += $qMax;
            }
            $catMin += $qMin;
            $catMax += $qMax;

            $questions[] = [
                'number' => $q['number'],
                'text' => $q['text'],
                'text_ta' => $q['text_ta'] ?? null,
                'type' => $q['type'] ?? $defaultType,
                'scale_type' => $q['scale_type'] ?? null,
                'sub_category' => $sub,
                'options' => $resolved,
                'min_score' => $qMin,
                'max_score' => $qMax,
            ];
        }

        $bands = [];
        $order = 0;
        foreach ($def['bands']['total'] ?? [] as $b) {
            $bands[] = self::band(null, $b, ++$order);
        }
        foreach ($def['sub_categories'] ?? [] as $s) {
            foreach ($s['bands'] ?? $def['subcategory_bands'] ?? [] as $b) {
                $bands[] = self::band($s['code'], $b, ++$order);
            }
        }

        return [
            'category' => [
                'code' => $def['code'],
                'title' => $def['title'],
                'title_ta' => $def['title_ta'] ?? null,
                'domain' => $def['domain'] ?? null,
                'description' => $def['description'] ?? null,
                'instructions' => $def['instructions'] ?? null,
                'instructions_ta' => $def['instructions_ta'] ?? null,
                'total_mode' => $totalMode,
                'min_score' => $totalMode === 'sum' ? $catMin : null,
                'max_score' => $totalMode === 'sum' ? $catMax : null,
                'sort_order' => $def['sort_order'] ?? 0,
            ],
            'sub_categories' => array_values($subs),
            'questions' => $questions,
            'bands' => $bands,
        ];
    }

    private static function band(?string $sub, array $b, int $order): array
    {
        return [
            'sub_category' => $sub,
            'min_score' => $b['min'],
            'max_score' => $b['max'],
            'label' => $b['label'],
            'level' => $b['level'],
            'interpretation' => $b['interpretation'] ?? null,
            'sort_order' => $order,
        ];
    }
}
