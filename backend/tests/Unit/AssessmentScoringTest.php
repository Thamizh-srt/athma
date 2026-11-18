<?php

namespace Tests\Unit;

use App\Services\Assessment\AssessmentDefinition;
use App\Services\Assessment\ScoreCalculator;
use PHPUnit\Framework\TestCase;

/** Pure PHP tests: no database, no framework boot. Run with `php artisan test --testsuite=Unit`. */
class AssessmentScoringTest extends TestCase
{
    private function load(string $file): array
    {
        $json = json_decode(file_get_contents(dirname(__DIR__, 2)."/database/data/assessments/$file"), true, 512, JSON_THROW_ON_ERROR);

        return AssessmentDefinition::resolve($json);
    }

    /** Score every question with `$pick(questionNumber, options)` -> option value; returns calculator rows keyed by sub code / 'TOTAL'. */
    private function run_(string $file, callable $pick): array
    {
        $d = $this->load($file);
        $subIdByCode = [];
        foreach ($d['sub_categories'] as $i => $s) {
            $subIdByCode[$s['code']] = $i + 1;
        }
        $answers = [];
        foreach ($d['questions'] as $q) {
            $value = $pick($q['number'], $q['options']);
            $opt = array_values(array_filter($q['options'], fn ($o) => $o['value'] === $value))[0];
            $answers[] = ['sub_category_id' => $q['sub_category'] ? $subIdByCode[$q['sub_category']] : null, 'score' => $opt['score']];
        }
        $bands = array_map(fn ($b) => [
            'sub_category_id' => $b['sub_category'] ? $subIdByCode[$b['sub_category']] : null,
            'min_score' => $b['min_score'], 'max_score' => $b['max_score'], 'label' => $b['label'],
            'level' => $b['level'], 'interpretation' => $b['interpretation'],
        ], $d['bands']);

        $rows = (new ScoreCalculator())->calculate($answers, array_values($subIdByCode), $bands, $d['category']['total_mode']);
        $byCode = [];
        $codes = array_flip($subIdByCode);
        foreach ($rows as $r) {
            $byCode[$r['sub_category_id'] === null ? 'TOTAL' : $codes[$r['sub_category_id']]] = $r;
        }

        return $byCode;
    }

    // ---------------------------------------------------------------- structure

    public function test_question_counts_and_sub_category_mapping(): void
    {
        $expected = [
            '01_beis10.json' => [10, ['AOE' => 2, 'AOTE' => 2, 'ROE' => 2, 'ROTE' => 2, 'UE' => 2]],
            '02_mhi38.json' => [38, ['ANX' => 9, 'DEP' => 4, 'LBEC' => 9, 'GPA' => 10, 'ET' => 2, 'LS' => 1]],
            '03_scared.json' => [41, ['PAN' => 13, 'GAD' => 9, 'SEP' => 8, 'SOC' => 7, 'SCH' => 4]],
            '04_isaa.json' => [40, ['SRR' => 9, 'ER' => 5, 'SLC' => 9, 'BP' => 7, 'SA' => 6, 'CC' => 4]],
            '05_gds15.json' => [15, []],
            '06_bfi10.json' => [10, ['E' => 2, 'A' => 2, 'C' => 2, 'N' => 2, 'O' => 2]],
        ];
        foreach ($expected as $file => [$count, $subs]) {
            $d = $this->load($file);
            $this->assertCount($count, $d['questions'], $file);
            $this->assertSame(range(1, $count), array_column($d['questions'], 'number'), $file);
            $perSub = array_count_values(array_filter(array_column($d['questions'], 'sub_category')));
            $this->assertEquals($subs, $perSub, $file);
        }
    }

    public function test_isaa_scale_types_are_preserved_when_resolving_questions(): void
    {
        $d = $this->load('04_isaa.json');

        $this->assertSame('Scale: A', $d['questions'][0]['scale_type']);
        $this->assertSame('Scale: B', $d['questions'][9]['scale_type']);
        $this->assertSame('Scale: F', $d['questions'][39]['scale_type']);
    }

    public function test_beis_item_mapping_matches_the_pdf(): void
    {
        $d = $this->load('01_beis10.json');
        $map = array_column($d['questions'], 'sub_category', 'number');
        $this->assertSame(['AOE', 'AOE', 'AOTE', 'AOTE', 'ROE', 'ROE', 'ROTE', 'ROTE', 'UE', 'UE'], array_values($map));
        foreach ($d['sub_categories'] as $s) {
            $this->assertSame([2, 10], [$s['min_score'], $s['max_score']], $s['code']);
        }
        $this->assertSame([10, 50], [$d['category']['min_score'], $d['category']['max_score']]);
        foreach ($d['questions'] as $q) {
            $this->assertSame([1, 2, 3, 4, 5], array_column($q['options'], 'score'));
        }
    }

    public function test_mhi_subscale_ranges_match_the_document_table(): void
    {
        $d = $this->load('02_mhi38.json');
        $range = [];
        foreach ($d['sub_categories'] as $s) {
            $range[$s['code']] = [$s['min_score'], $s['max_score']];
        }
        $this->assertEquals([
            'ANX' => [9, 54], 'DEP' => [4, 23], 'LBEC' => [9, 53], 'GPA' => [10, 60], 'ET' => [2, 12], 'LS' => [1, 6],
        ], $range);
        $this->assertNull($d['category']['min_score']);   // no overall MHI total is defined in the supplied document
    }

    public function test_scared_subscale_ranges(): void
    {
        $d = $this->load('03_scared.json');
        $max = array_column($d['sub_categories'], 'max_score', 'code');
        $this->assertSame(['PAN' => 26, 'GAD' => 18, 'SEP' => 16, 'SOC' => 14, 'SCH' => 8], $max);
        $this->assertSame(82, $d['category']['max_score']);
    }

    // ---------------------------------------------------------------- scoring

    public function test_beis_total_and_subscales(): void
    {
        // answers of the patient shown in the admin screenshot: totals 4,4,7,7,5 = 27
        $values = [1 => 1, 2 => 3, 3 => 2, 4 => 2, 5 => 4, 6 => 3, 7 => 4, 8 => 3, 9 => 2, 10 => 3];
        $r = $this->run_('01_beis10.json', fn ($n) => $values[$n]);
        $this->assertSame([4, 4, 7, 7, 5], [$r['AOE']['score'], $r['AOTE']['score'], $r['ROE']['score'], $r['ROTE']['score'], $r['UE']['score']]);
        $this->assertSame(27, $r['TOTAL']['score']);
    }

    public function test_bfi_reverse_scoring(): void
    {
        // item 1 is reverse-scored: 1 -> 5. Extraversion = 1R + 6 = 5 + 5 = 10 -> Very High
        $r = $this->run_('06_bfi10.json', fn ($n) => in_array($n, [1, 6], true) ? ($n === 1 ? 1 : 5) : 3);
        $this->assertSame(10, $r['E']['score']);
        $this->assertSame('Very High', $r['E']['label']);
        $this->assertArrayNotHasKey('TOTAL', $r);               // BFI-10 has no total
        $this->assertSame('Average', $r['A']['label']);          // 3 + 3(R) = 6
    }

    public function test_gds_yes_no_scoring(): void
    {
        $dep = [1 => 'No', 5 => 'No', 7 => 'No', 11 => 'No', 13 => 'No'];   // depressive answer is "No"
        // everyone answers "No" (value 2): only the 5 reverse items score 1 -> 5 = Normal
        $r = $this->run_('05_gds15.json', fn () => 2);
        $this->assertSame(5, $r['TOTAL']['score']);
        $this->assertSame('Normal', $r['TOTAL']['label']);
        // everyone answers "Yes" (value 1): the other 10 items score 1 -> 10 = Suggests depression
        $r = $this->run_('05_gds15.json', fn () => 1);
        $this->assertSame(10, $r['TOTAL']['score']);
        $this->assertSame('Suggests depression', $r['TOTAL']['label']);
        // every depressive answer -> 15
        $r = $this->run_('05_gds15.json', fn ($n) => isset($dep[$n]) ? 2 : 1);
        $this->assertSame(15, $r['TOTAL']['score']);
    }

    public function test_gds_option_scores_are_swapped_for_reverse_items(): void
    {
        $d = $this->load('05_gds15.json');
        $q1 = $d['questions'][0];   // "Are you basically satisfied with your life?"  No = depressed
        $this->assertSame(['Yes' => 0, 'No' => 1], array_column($q1['options'], 'score', 'label'));
        $q2 = $d['questions'][1];   // "Have you dropped many activities?"  Yes = depressed
        $this->assertSame(['Yes' => 1, 'No' => 0], array_column($q2['options'], 'score', 'label'));
    }

    public function test_scared_cutoffs(): void
    {
        // school avoidance cut-off = 3: items 2, 11, 17, 36
        $two = fn (array $hot) => fn ($n) => in_array($n, $hot, true) ? 2 : 0;
        $r = $this->run_('03_scared.json', $two([2, 11]));          // 4 points
        $this->assertSame('Above cut-off', $r['SCH']['label']);
        $r = $this->run_('03_scared.json', fn ($n) => $n === 2 ? 2 : ($n === 11 ? 0 : 0));   // 2 points
        $this->assertSame('Normal', $r['SCH']['label']);
        $r = $this->run_('03_scared.json', fn ($n) => in_array($n, [2, 11], true) ? ($n === 2 ? 2 : 1) : 0);   // 3 points = cut-off
        $this->assertSame('Above cut-off', $r['SCH']['label']);
        // totals: 24 normal, 25 possible, 31 more specific
        $all2 = $this->run_('03_scared.json', fn () => 2);
        $this->assertSame(82, $all2['TOTAL']['score']);
        $this->assertSame('high', $all2['TOTAL']['level']);
        $this->assertSame('normal', $this->run_('03_scared.json', fn () => 0)['TOTAL']['level']);
    }

    public function test_isaa_severity_boundaries(): void
    {
        $d = $this->load('04_isaa.json');
        $calc = new ScoreCalculator();
        $bands = array_map(fn ($b) => ['sub_category_id' => null] + $b, array_filter($d['bands'], fn ($b) => $b['sub_category'] === null));
        foreach ([40 => 'No autism', 69 => 'No autism', 70 => 'Mild autism', 106 => 'Mild autism', 107 => 'Moderate autism', 153 => 'Moderate autism', 154 => 'Severe autism', 200 => 'Severe autism'] as $total => $label) {
            // 40 answers, each 1..5, summing to $total
            $answers = [];
            $left = $total - 40;
            for ($i = 0; $i < 40; $i++) {
                $extra = min(4, $left);
                $left -= $extra;
                $answers[] = ['sub_category_id' => null, 'score' => 1 + $extra];
            }
            $rows = $calc->calculate($answers, [], array_values($bands), 'sum');
            $this->assertSame($total, $rows[0]['score']);
            $this->assertSame($label, $rows[0]['label'], "total $total");
        }
    }

    public function test_mhi_flagged_options_and_no_total(): void
    {
        $d = $this->load('02_mhi38.json');
        $flagged = [];
        foreach ($d['questions'] as $q) {
            foreach ($q['options'] as $o) {
                if ($o['is_flagged']) {
                    $flagged[$q['number']][] = $o['value'];
                }
            }
        }
        $this->assertSame([21 => [1, 2, 3, 4], 28 => [1, 2, 3, 4]], $flagged);
        $r = $this->run_('02_mhi38.json', fn () => 1);
        $this->assertArrayNotHasKey('TOTAL', $r);
        $this->assertSame([54, 23, 38, 60, 12, 6], [$r['ANX']['score'], $r['DEP']['score'], $r['LBEC']['score'], $r['GPA']['score'], $r['ET']['score'], $r['LS']['score']]);
    }
}
