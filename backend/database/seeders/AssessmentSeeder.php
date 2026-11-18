<?php

namespace Database\Seeders;

use App\Models\AssessmentCategory;
use App\Models\AssessmentOption;
use App\Models\AssessmentQuestion;
use App\Models\AssessmentScoreBand;
use App\Models\AssessmentSubCategory;
use App\Services\Assessment\AssessmentDefinition;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

/**
 * Loads every database/data/assessments/*.json file:
 *   category -> sub categories -> questions -> options (with scores) -> score bands.
 *
 * Safe to re-run: rows are matched on their natural keys (code / number / value), so ids
 * and patient answers are preserved. Score bands are rebuilt each run.
 */
class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        $files = glob(database_path('data/assessments/*.json')) ?: [];
        sort($files);

        foreach ($files as $file) {
            $json = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
            DB::transaction(fn () => $this->import(AssessmentDefinition::resolve($json)));
            $this->command?->info('Seeded '.$json['code']);
        }
    }

    private function import(array $d): void
    {
        $category = AssessmentCategory::updateOrCreate(['code' => $d['category']['code']], $d['category']);

        // sub categories
        $subIds = [];
        foreach ($d['sub_categories'] as $sub) {
            $subIds[$sub['code']] = AssessmentSubCategory::updateOrCreate(
                ['category_id' => $category->id, 'code' => $sub['code']],
                Arr::except($sub, ['code'])
            )->id;
        }

        // questions + options
        foreach ($d['questions'] as $q) {
            $question = AssessmentQuestion::updateOrCreate(
                ['category_id' => $category->id, 'number' => $q['number']],
                [
                    'sub_category_id' => $q['sub_category'] ? $subIds[$q['sub_category']] : null,
                    'text' => $q['text'],
                    'text_ta' => $q['text_ta'],
                    'type' => $q['type'],
                    'scale_type' => $q['scale_type'] ?? null,
                ]
            );

            foreach ($q['options'] as $o) {
                AssessmentOption::updateOrCreate(
                    ['question_id' => $question->id, 'value' => $o['value']],
                    Arr::except($o, ['value'])
                );
            }
        }

        // score bands (total + per sub category)
        AssessmentScoreBand::where('category_id', $category->id)->delete();
        foreach ($d['bands'] as $b) {
            AssessmentScoreBand::create([
                'category_id' => $category->id,
                'sub_category_id' => $b['sub_category'] ? $subIds[$b['sub_category']] : null,
                'min_score' => $b['min_score'],
                'max_score' => $b['max_score'],
                'label' => $b['label'],
                'level' => $b['level'],
                'interpretation' => $b['interpretation'],
                'sort_order' => $b['sort_order'],
            ]);
        }
    }
}
