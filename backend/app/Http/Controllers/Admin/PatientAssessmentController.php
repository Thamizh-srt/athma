<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssessmentCategory;
use App\Models\Patient;
use App\Models\PatientAssessment;
use App\Support\AssessmentPresenter as P;
use App\Support\ScoreBandResolver;
use Illuminate\Http\JsonResponse;

/**
 * Admin patient detail page. GET admin/patients/{patient}/assessments returns the assessment list AND each
 * assessment's score summary + answers (`detail`); GET .../assessments/{category} returns just one `detail`. Low / Normal / High is derived from the saved answers + the current score bands.
 */
class PatientAssessmentController extends Controller
{
    public function index(Patient $patient): JsonResponse
    {
        $attempts = PatientAssessment::where('patient_id', $patient->id)
            ->with('answers.option')
            ->get()->keyBy('category_id');

        $categories = AssessmentCategory::active()
            ->with(['subCategories', 'questions', 'scoreBands'])
            ->orderBy('sort_order')->get();

        $rows = $categories->map(function (AssessmentCategory $c) use ($attempts) {
            $a = $attempts->get($c->id);
            $detail = $a ? $this->detail($c, $a) : null;      // null = not started
            $count = $c->questions->count();
            $answered = $a?->answers->count() ?? 0;

            return [
                'category_id' => $c->id,
                'code' => $c->code,
                'title' => $c->title,
                'status' => $a?->status ?? 'not_started',
                'questions_count' => $count,
                'answered_count' => $answered,
                'progress' => $count ? (int) round($answered / $count * 100) : 0,
                'completed_at' => $a?->completed_at,
                'has_alert' => $detail ? count($detail['alerts']) > 0 : false,
                'total' => ($detail['total'] ?? null) ? [
                    'score' => $detail['total']['score'],
                    'label' => $detail['total']['label'],
                    'level' => $detail['total']['level'],
                ] : null,
                'detail' => $detail,
            ];
        });

        return response()->json([
            'patient' => ['id' => $patient->id, 'full_name' => $patient->full_name],
            'quizzes_attended' => $attempts->count(),
            'data' => $rows->values(),
        ]);
    }

    /** Same `detail` payload for one assessment (used when the page opens/refreshes a single assessment). */
    public function show(Patient $patient, AssessmentCategory $category): JsonResponse
    {
        $category->load(['subCategories', 'questions', 'scoreBands']);
        $attempt = PatientAssessment::where('patient_id', $patient->id)->where('category_id', $category->id)
            ->with('answers.option')->first();
        abort_if(! $attempt, 404, 'This patient has not started this assessment.');

        return response()->json($this->detail($category, $attempt));
    }

    /**
     * Score summary, sub scale scores and every question with the selected option.
     * Scores are summed from the saved answers (so "current score" works while in progress);
     * a Low/Normal/High band is only given once every question it covers has been answered.
     */
    private function detail(AssessmentCategory $category, PatientAssessment $attempt): array
    {
        $bands = $category->scoreBands;
        $bandRows = fn ($rows) => $rows->map(fn ($b) => [
            'label' => $b->label, 'level' => $b->level, 'min_score' => $b->min_score, 'max_score' => $b->max_score,
        ])->values()->all();

        $answers = $attempt->answers->keyBy('question_id');
        $subOf = $category->questions->pluck('sub_category_id', 'id');
        $subKey = fn ($a) => $subOf[$a->question_id] ?? 0;               // 0 = question without a sub category
        $scoreBySub = $attempt->answers->groupBy($subKey)->map(fn ($g) => (int) $g->sum('score'));
        $answeredBySub = $attempt->answers->countBy($subKey);

        $questions = $category->questions->map(function ($q) use ($answers) {
            $a = $answers->get($q->id);

            return [
                'id' => $q->id,
                'number' => $q->number,
                'sub_category_id' => $q->sub_category_id,
                'text' => P::pair($q->text, $q->text_ta),
                'status' => $a ? 'answered' : 'not_attended',
                'selected' => $a ? [
                    'option_id' => $a->option_id,
                    'value' => $a->option->value,
                    'label' => P::pair($a->option->label, $a->option->label_ta),
                    'score' => $a->score,
                ] : null,
                'flagged' => (bool) ($a?->option->is_flagged),
            ];
        });

        $subs = $category->subCategories->map(function ($s) use ($category, $bands, $bandRows, $scoreBySub, $answeredBySub) {
            $qCount = $category->questions->where('sub_category_id', $s->id)->count();
            $answered = (int) ($answeredBySub[$s->id] ?? 0);
            $score = $answered > 0 ? (int) $scoreBySub[$s->id] : null;
            $band = ($score !== null && $answered >= $qCount) ? ScoreBandResolver::find($bands, (int) $s->id, $score) : null;

            return [
                'id' => $s->id,
                'code' => $s->code,
                'name' => P::pair($s->name, $s->name_ta),
                'description' => $s->description,
                'questions_count' => $qCount,
                'answered_count' => $answered,
                'min_score' => $s->min_score,
                'max_score' => $s->max_score,
                'bands' => $bandRows($bands->where('sub_category_id', $s->id)),   // drives the Low / Normal / High meter
                'score' => $score,
                'label' => $band?->label,
                'level' => $band?->level,
                'interpretation' => $band?->interpretation,
            ];
        });

        $answered = $questions->where('status', 'answered')->count();
        $isComplete = $questions->count() > 0 && $answered >= $questions->count();

        $totalScore = $answered > 0 ? (int) $attempt->answers->sum('score') : null;
        $totalBand = ($isComplete && $totalScore !== null) ? ScoreBandResolver::find($bands, null, $totalScore) : null;

        return [
            'category' => ['id' => $category->id, 'code' => $category->code, 'title' => $category->title, 'domain' => $category->domain],
            'status' => $attempt->status,
            'language' => $attempt->language,
            'started_at' => $attempt->started_at,
            'completed_at' => $attempt->completed_at,
            'is_complete' => $isComplete,                  // every question answered (patient may not have pressed submit yet)
            'scores_available' => $answered > 0,
            'summary' => ['questions' => $questions->count(), 'answered' => $answered, 'not_attended' => $questions->count() - $answered],
            'total' => ($category->total_mode === 'sum' && $totalScore !== null) ? [
                'score' => $totalScore,
                'min_score' => $category->min_score,
                'max_score' => $category->max_score,
                'label' => $totalBand?->label,
                'level' => $totalBand?->level,
                'interpretation' => $totalBand?->interpretation,
                'bands' => $bandRows($bands->whereNull('sub_category_id')),
            ] : null,
            'sub_categories' => $subs->values(),
            'level_counts' => $subs->pluck('level')->filter()->countBy()->all(),   // e.g. {"low":1,"normal":2,"high":2}
            'alerts' => $questions->where('flagged', true)->map(fn ($q) => [
                'question_number' => $q['number'],
                'question' => $q['text']['en'],
                'answer' => $q['selected']['label']['en'],
            ])->values()->all(),
            'questions' => $questions->values(),
        ];
    }
}
