<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveAssessmentResponsesRequest;
use App\Models\AssessmentAnswerOption;
use App\Models\AssessmentAttempt;
use App\Models\AssessmentCategory;
use App\Models\AssessmentQuestion;
use App\Models\AssessmentSubcategory;
use App\Services\AssessmentScoringService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PatientAssessmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = AssessmentCategory::query()
            ->where('is_active', true)
            ->with(['subcategories' => fn ($query) => $query
                // ->where('is_published', true)
                ->withCount('questions')])
            ->orderBy('sort_order')
            ->get();

        $subcategoryIds = $categories->flatMap(fn ($category) => $category->subcategories->pluck('id'));
        $attempts = AssessmentAttempt::query()
            ->where('patient_id', $request->user()->id)
            ->whereIn('subcategory_id', $subcategoryIds)
            ->orderByDesc('id')
            ->get()
            ->groupBy('subcategory_id');

        return response()->json([
            'categories' => $categories->map(fn (AssessmentCategory $category) => [
                'id' => $category->id,
                'title' => $category->title,
                'description' => $category->description,
                'subcategories' => $category->subcategories->map(function (AssessmentSubcategory $subcategory) use ($attempts) {
                    $currentAttempts = $attempts->get($subcategory->id, collect())
                        ->where('subcategory_version', $subcategory->version);
                    $attempt = $currentAttempts->firstWhere('status', 'completed')
                        ?? $currentAttempts->firstWhere('status', 'in_progress');

                    return [
                        'id' => $subcategory->id,
                        'title' => $subcategory->title,
                        'description' => $subcategory->description,
                        'questions_count' => $subcategory->questions_count,
                        'status' => $attempt?->status ?? 'pending',
                        'attempt_id' => $attempt?->id,
                    ];
                })->values(),
            ])->values(),
        ]);
    }

    public function showSubcategory(Request $request, AssessmentSubcategory $subcategory): JsonResponse
    {
        $this->ensurePublished($subcategory);
        $subcategory->load(['category:id,title', 'questions.answerOptions']);
        $attempt = AssessmentAttempt::query()
            ->where('patient_id', $request->user()->id)
            ->where('subcategory_id', $subcategory->id)
            ->where('subcategory_version', $subcategory->version)
            ->orderByDesc('id')
            ->first();

        return response()->json([
            'id' => $subcategory->id,
            'title' => $subcategory->title,
            'description' => $subcategory->description,
            'instructions' => $subcategory->instructions,
            'version' => $subcategory->version,
            'status' => $attempt?->status ?? 'pending',
            'attempt_id' => $attempt?->id,
            'category' => $subcategory->category,
            'questions' => $subcategory->questions->map(fn (AssessmentQuestion $question) => [
                'id' => $question->id,
                'position' => $question->position,
                'title' => $question->title,
                'required' => $question->is_required,
                'options' => $question->answerOptions->map(fn (AssessmentAnswerOption $option) => [
                    'id' => $option->id,
                    'position' => $option->position,
                    'label' => $option->label,
                    'value' => $option->value,
                ])->values(),
            ])->values(),
        ]);
    }

    public function start(Request $request, AssessmentSubcategory $subcategory): JsonResponse
    {
        $this->ensurePublished($subcategory);

        if (! $subcategory->questions()->exists()) {
            throw new HttpException(409, 'This assessment has no questions yet.');
        }

        $patientId = $request->user()->id;
        $existingAttempt = AssessmentAttempt::query()
            ->where('patient_id', $patientId)
            ->where('subcategory_id', $subcategory->id)
            ->where('subcategory_version', $subcategory->version)
            ->first();

        if ($existingAttempt?->status === 'completed') {
            throw new HttpException(409, 'This assessment has already been completed.');
        }

        $attempt = AssessmentAttempt::firstOrCreate(
            [
                'patient_id' => $patientId,
                'subcategory_id' => $subcategory->id,
                'subcategory_version' => $subcategory->version,
            ],
            ['status' => 'in_progress', 'started_at' => now()]
        );

        if ($attempt->status !== 'in_progress') {
            throw new HttpException(409, 'This assessment has already been completed.');
        }

        return response()->json([
            'id' => $attempt->id,
            'status' => $attempt->status,
            'responses' => $attempt->responses()->get(['question_id', 'answer_option_id']),
        ], $attempt->wasRecentlyCreated ? 201 : 200);
    }

    public function showAttempt(Request $request, AssessmentAttempt $attempt): JsonResponse
    {
        $this->ensureAttemptOwner($request, $attempt);
        $attempt->load('subcategory:id,title');

        return response()->json([
            'id' => $attempt->id,
            'status' => $attempt->status,
            'title' => $attempt->subcategory->title,
            'responses' => $attempt->responses()->get([
                'question_id', 'answer_option_id', 'question_title_snapshot', 'answer_label_snapshot',
            ]),
            'results' => $attempt->status === 'completed' ? [
                'total_score' => $attempt->total_score,
                'dimensions' => $attempt->results['dimensions'] ?? [],
            ] : null,
            'completed_at' => $attempt->completed_at,
        ]);
    }

    public function saveResponses(
        SaveAssessmentResponsesRequest $request,
        AssessmentAttempt $attempt
    ): JsonResponse {
        $this->ensureAttemptOwner($request, $attempt);
        $this->ensureAttemptInProgress($attempt);

        $responses = $request->validated('responses');
        $questions = AssessmentQuestion::query()
            ->where('subcategory_id', $attempt->subcategory_id)
            ->whereIn('id', collect($responses)->pluck('question_id'))
            ->get()
            ->keyBy('id');
        $options = AssessmentAnswerOption::query()
            ->whereIn('id', collect($responses)->pluck('option_id'))
            ->get()
            ->keyBy('id');

        foreach ($responses as $response) {
            $question = $questions->get($response['question_id']);
            $option = $options->get($response['option_id']);

            if (! $question || ! $option || $option->question_id !== $question->id) {
                throw ValidationException::withMessages([
                    'responses' => ['Each answer option must belong to its question in this assessment.'],
                ]);
            }
        }

        DB::transaction(function () use ($request, $attempt, $responses, $questions, $options): void {
            $lockedAttempt = AssessmentAttempt::query()->lockForUpdate()->findOrFail($attempt->id);
            $this->ensureAttemptOwner($request, $lockedAttempt);
            $this->ensureAttemptInProgress($lockedAttempt);

            foreach ($responses as $response) {
                $question = $questions->get($response['question_id']);
                $option = $options->get($response['option_id']);

                $lockedAttempt->responses()->updateOrCreate(
                    ['question_id' => $question->id],
                    [
                        'answer_option_id' => $option->id,
                        'question_title_snapshot' => $question->title,
                        'answer_label_snapshot' => $option->label,
                        'awarded_score' => $option->score,
                    ]
                );
            }
        });

        return response()->json([
            'saved' => count($responses),
            'answered_count' => $attempt->responses()->count(),
        ]);
    }

    public function submit(
        Request $request,
        AssessmentAttempt $attempt,
        AssessmentScoringService $scoring
    ): JsonResponse {
        $this->ensureAttemptOwner($request, $attempt);

        if ($attempt->status === 'completed') {
            return $this->showAttempt($request, $attempt->fresh());
        }

        $result = DB::transaction(function () use ($attempt, $scoring): array {
            $attempt = AssessmentAttempt::query()->lockForUpdate()->findOrFail($attempt->id);

            if ($attempt->status === 'completed') {
                return $attempt->results;
            }

            $requiredQuestionIds = $attempt->subcategory
                ->questions()
                ->where('is_required', true)
                ->pluck('id');
            $answeredQuestionIds = $attempt->responses()->whereNotNull('question_id')->pluck('question_id');

            if ($requiredQuestionIds->diff($answeredQuestionIds)->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'responses' => ['Answer every required question before submitting.'],
                ]);
            }

            $result = $scoring->calculate($attempt);
            $attempt->update([
                'status' => 'completed',
                'total_score' => $result['total_score'],
                'results' => $result,
                'completed_at' => now(),
            ]);

            return $result;
        });

        return response()->json([
            'id' => $attempt->id,
            'status' => 'completed',
            'results' => $result,
        ]);
    }

    private function ensurePublished(AssessmentSubcategory $subcategory): void
    {
        abort_unless(
            $subcategory && $subcategory->category()->where('is_active', true)->exists(),
            404
        );
    }

    private function ensureAttemptOwner(Request $request, AssessmentAttempt $attempt): void
    {
        abort_unless($attempt->patient_id === $request->user()->id, 404);
    }

    private function ensureAttemptInProgress(AssessmentAttempt $attempt): void
    {
        if ($attempt->status !== 'in_progress') {
            throw new HttpException(409, 'This assessment attempt is no longer in progress.');
        }
    }
}
