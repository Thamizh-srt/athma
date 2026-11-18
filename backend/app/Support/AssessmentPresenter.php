<?php

namespace App\Support;

use App\Models\AssessmentOption;
use App\Models\AssessmentQuestion;

/** Builds the JSON shapes the React app expects ({en, ta} pairs, Tamil falls back to English). */
final class AssessmentPresenter
{
    public static function pair(?string $en, ?string $ta = null): array
    {
        return ['en' => $en, 'ta' => $ta ?: $en];
    }

    /** Patients never receive scores; admins do. */
    public static function option(AssessmentOption $option, bool $admin = false): array
    {
        $row = [
            'id' => $option->id,
            'value' => $option->value,
            'label' => self::pair($option->label, $option->label_ta),
        ];
        if ($admin) {
            $row['score'] = $option->score;
            $row['is_flagged'] = (bool) $option->is_flagged;
        }

        return $row;
    }

    public static function question(AssessmentQuestion $q, bool $admin = false): array
    {
        return [
            'id' => $q->id,
            'number' => $q->number,
            'order' => $q->number,
            'type' => $q->type,
            'scale_type' => $q->scale_type,
            'sub_category_id' => $q->sub_category_id,
            'text' => self::pair($q->text, $q->text_ta),
            'options' => $q->options->map(fn ($o) => self::option($o, $admin))->values()->all(),
        ];
    }
}
