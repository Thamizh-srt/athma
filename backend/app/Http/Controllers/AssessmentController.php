<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveAnswersRequest;
use App\Models\AssessmentCategory;
use App\Models\PatientAssessment;
use App\Services\Assessment\AssessmentService;
use App\Support\AssessmentPresenter as P;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Patient-facing: list assessments, open one, save answers, submit and view results. */
class AssessmentController extends Controller
{
    public function __construct(private readonly AssessmentService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $attempts = PatientAssessment::where('patient_id', $request->user()->id)
            ->withCount('answers')->get()->keyBy('category_id');

        $data = AssessmentCategory::active()->withCount('questions')->orderBy('sort_order')->get()
            ->map(function ($c) use ($attempts) {
                $a = $attempts->get($c->id);

                return [
                    'id' => $c->id,
                    'code' => $c->code,
                    'title' => $c->title,
                    'title_ta' => $c->title_ta ?: $c->title,
                    'domain' => $c->domain,
                    'description' => $c->description,
                    'questions_count' => $c->questions_count,
                    'status' => $a?->status ?? 'pending',
                    'answered_count' => $a?->answers_count ?? 0,
                    'completed_at' => $a?->completed_at,
                ];
            });

        return response()->json(['data' => $data]);
    }

    public function show(Request $request, AssessmentCategory $category): JsonResponse
    {
        abort_unless($category->is_active, 404);

        $category->load(['subCategories', 'questions.options']);
        $attempt = PatientAssessment::where('patient_id', $request->user()->id)
            ->where('category_id', $category->id)
            ->with(['answers', 'results.subCategory'])
            ->first();
        $selected = $attempt ? $attempt->answers->pluck('option_id', 'question_id') : collect();
        $results = $attempt?->results ?? collect();
        $totalResult = $results->firstWhere('sub_category_id', null);

        return response()->json([
            'id' => $category->id,
            'code' => $category->code,
            'title' => $category->title,
            'title_ta' => $category->title_ta ?: $category->title,
            'domain' => $category->domain,
            'description' => $category->description,
            'instructions' => P::pair($category->instructions, $category->instructions_ta),
            'status' => $attempt?->status ?? 'not_started',
            'attempt_id' => $attempt?->id,
            'questions_count' => $category->questions->count(),
            'answered_count' => $selected->count(),
            'answers' => $attempt?->answers->map(fn ($answer) => [
                'question_id' => $answer->question_id,
                'option_id' => $answer->option_id,
            ])->values() ?? collect(),
            'results' => $attempt?->isCompleted() ? [
                'total_score' => $totalResult?->score,
                'dimensions' => $results
                    ->whereNotNull('sub_category_id')
                    ->map(fn ($result) => [
                        'code' => $result->subCategory?->code ?? (string) $result->sub_category_id,
                        'title' => P::pair(
                            $result->subCategory?->name ?? 'Assessment result',
                            $result->subCategory?->name_ta
                        ),
                        'score' => $result->score,
                        'interpretation' => [
                            'label' => $result->label,
                            'description' => $result->interpretation,
                        ],
                    ])->values(),
            ] : null,
            'sub_categories' => $category->subCategories->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->code,
                'name' => P::pair($s->name, $s->name_ta),
                'questions_count' => $category->questions->where('sub_category_id', $s->id)->count(),
            ])->values(),
            // flat, in form order; each question carries its sub_category_id (null for scales with none)
            'questions' => $category->questions->map(fn ($q) => P::question($q) + [
                'required' => true,
                'selected_option_id' => $selected->get($q->id),
            ])->values(),
        ]);
    }

    public function saveAnswers(SaveAnswersRequest $request, AssessmentCategory $category): JsonResponse
    {
        abort_unless($category->is_active, 404);

        $attempt = $this->service->saveAnswers(
            $request->user(), $category, $request->validated('answers', []), $request->validated('language')
        );

        return response()->json([
            'status' => $attempt->status,
            'answered_count' => $attempt->answers()->count(),
            'questions_count' => $category->questions()->count(),
        ]);
    }

    public function submit(SaveAnswersRequest $request, AssessmentCategory $category): JsonResponse
    {
        abort_unless($category->is_active, 404);

        $attempt = $this->service->submit(
            $request->user(), $category, $request->validated('answers', []), $request->validated('language')
        );

        return response()->json([
            'status' => $attempt->status,
            'completed_at' => $attempt->completed_at,
            'needs_support' => $this->service->needsSupport($attempt),   // show helpline info in the UI
        ]);
    }
}
