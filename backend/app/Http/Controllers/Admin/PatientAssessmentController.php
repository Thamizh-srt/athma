<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssessmentCategory;
use App\Models\Patient;
use App\Models\PatientAssessment;
use App\Support\AssessmentPresenter as P;
use Illuminate\Http\JsonResponse;

/** Admin: what a patient answered and how it scored (the Patient detail page). */
class PatientAssessmentController extends Controller
{
    /** Right-hand "Assessments" list: progress + headline score per assessment. */
    public function index(Patient $patient): JsonResponse
    {
        $attempts = PatientAssessment::where('patient_id', $patient->id)
            ->withCount('answers')
            ->withExists(['answers as has_alert' => fn ($q) => $q->whereHas('option', fn ($o) => $o->where('is_flagged', true))])
            ->with(['results' => fn ($q) => $q->whereNull('sub_category_id')])
            ->get()->keyBy('category_id');

        $rows = AssessmentCategory::active()->withCount('questions')->orderBy('sort_order')->get()
            ->map(function ($c) use ($attempts) {
                $a = $attempts->get($c->id);
                $total = $a?->results->first();

                return [
                    'category_id' => $c->id,
                    'code' => $c->code,
                    'title' => $c->title,
                    'status' => $a?->status ?? 'not_started',
                    'questions_count' => $c->questions_count,
                    'answered_count' => $a?->answers_count ?? 0,
                    'progress' => $c->questions_count ? (int) round(($a?->answers_count ?? 0) / $c->questions_count * 100) : 0,
                    'completed_at' => $a?->completed_at,
                    'has_alert' => (bool) ($a?->has_alert),
                    'total' => $total ? ['score' => $total->score, 'label' => $total->label, 'level' => $total->level] : null,
                ];
            });

        return response()->json([
            'patient' => ['id' => $patient->id, 'full_name' => $patient->full_name],
            'quizzes_attended' => $attempts->count(),
            'data' => $rows,
        ]);
    }

    /** Score summary, sub scale scores and every question with the selected option. */
    public function show(Patient $patient, AssessmentCategory $category): JsonResponse
    {
        $attempt = PatientAssessment::where('patient_id', $patient->id)->where('category_id', $category->id)
            ->with(['answers.option', 'results'])->first();
        abort_if(! $attempt, 404, 'This patient has not started this assessment.');

        $category->load(['subCategories', 'questions']);
        $answers = $attempt->answers->keyBy('question_id');
        $results = $attempt->results->keyBy(fn ($r) => $r->sub_category_id ?? 0);   // 0 = total row

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

        $subs = $category->subCategories->map(function ($s) use ($results, $category) {
            $r = $results->get($s->id);

            return [
                'id' => $s->id,
                'code' => $s->code,
                'name' => P::pair($s->name, $s->name_ta),
                'description' => $s->description,
                'questions_count' => $category->questions->where('sub_category_id', $s->id)->count(),
                'min_score' => $s->min_score,
                'max_score' => $s->max_score,
                'score' => $r?->score,
                'label' => $r?->label,
                'level' => $r?->level,
                'interpretation' => $r?->interpretation,
            ];
        });

        $total = $results->get(0);
        $answered = $questions->where('status', 'answered')->count();

        return response()->json([
            'category' => ['id' => $category->id, 'code' => $category->code, 'title' => $category->title, 'domain' => $category->domain],
            'status' => $attempt->status,
            'language' => $attempt->language,
            'started_at' => $attempt->started_at,
            'completed_at' => $attempt->completed_at,
            'scores_available' => $attempt->isCompleted(),
            'summary' => ['questions' => $questions->count(), 'answered' => $answered, 'not_attended' => $questions->count() - $answered],
            'total' => $total ? [
                'score' => $total->score,
                'min_score' => $category->min_score,
                'max_score' => $category->max_score,
                'label' => $total->label,
                'level' => $total->level,
                'interpretation' => $total->interpretation,
            ] : null,
            'sub_categories' => $subs->values(),
            'level_counts' => $subs->pluck('level')->filter()->countBy()->all(),   // e.g. {"low":3,"high":2}
            'alerts' => $questions->where('flagged', true)->map(fn ($q) => [
                'question_number' => $q['number'],
                'question' => $q['text']['en'],
                'answer' => $q['selected']['label']['en'],
            ])->values(),
            'questions' => $questions->values(),
        ]);
    }
}
