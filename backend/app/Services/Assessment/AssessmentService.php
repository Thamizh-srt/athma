<?php

namespace App\Services\Assessment;

use App\Models\AssessmentCategory;
use App\Models\AssessmentQuestion;
use App\Models\Patient;
use App\Models\PatientAnswer;
use App\Models\PatientAssessment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AssessmentService
{
    public function __construct(private readonly ScoreCalculator $calculator)
    {
    }

    /**
     * Save (upsert) answers as a draft. Creates the attempt on first save.
     *
     * @param  list<array{question_id: int, option_id: int}>  $answers
     */
    public function saveAnswers(Patient $patient, AssessmentCategory $category, array $answers, ?string $language = null): PatientAssessment
    {
        return DB::transaction(function () use ($patient, $category, $answers, $language) {
            $attempt = PatientAssessment::firstOrCreate(
                ['patient_id' => $patient->id, 'category_id' => $category->id],
                ['status' => PatientAssessment::IN_PROGRESS, 'language' => $language ?? 'en', 'started_at' => now()]
            );

            // lock the row so two quick submits cannot both pass the "already completed" check
            $attempt = PatientAssessment::whereKey($attempt->id)->lockForUpdate()->firstOrFail();

            if ($attempt->isCompleted()) {
                throw new HttpException(409, 'This assessment has already been submitted.');
            }
            if ($language && $attempt->language !== $language) {
                $attempt->update(['language' => $language]);
            }

            $questions = AssessmentQuestion::where('category_id', $category->id)
                ->whereIn('id', array_column($answers, 'question_id'))
                ->with('options')
                ->get()
                ->keyBy('id');

            $errors = [];
            $chosen = [];
            foreach ($answers as $i => $answer) {
                $option = $questions->get($answer['question_id'])?->options->firstWhere('id', $answer['option_id']);
                if (! $option) {
                    $errors["answers.$i.option_id"] = ['This option does not belong to the question, or the question is not part of this assessment.'];
                    continue;
                }
                $chosen[] = [$answer['question_id'], $option];
            }
            if ($errors) {
                throw ValidationException::withMessages($errors);
            }

            foreach ($chosen as [$questionId, $option]) {
                PatientAnswer::updateOrCreate(
                    ['patient_assessment_id' => $attempt->id, 'question_id' => $questionId],
                    ['option_id' => $option->id, 'score' => $option->score]   // score snapshot
                );
            }

            return $attempt;
        });
    }

    /** Final submit: every question must be answered; scores are calculated and stored. */
    public function submit(Patient $patient, AssessmentCategory $category, array $answers = [], ?string $language = null): PatientAssessment
    {
        return DB::transaction(function () use ($patient, $category, $answers, $language) {
            $attempt = $this->saveAnswers($patient, $category, $answers, $language);

            $answeredIds = $attempt->answers()->pluck('question_id');
            $missing = $category->questions()->whereNotIn('id', $answeredIds)->pluck('number');
            if ($missing->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'answers' => ['Please answer every question. Missing question numbers: '.$missing->implode(', ').'.'],
                ]);
            }

            $this->storeResults($attempt, $category);
            $attempt->update(['status' => PatientAssessment::COMPLETED, 'completed_at' => now()]);

            return $attempt->fresh();
        });
    }

    /** True when any selected option is flagged (e.g. MHI-38 items on suicidal thoughts). */
    public function needsSupport(PatientAssessment $attempt): bool
    {
        return $attempt->answers()->whereHas('option', fn ($q) => $q->where('is_flagged', true))->exists();
    }

    private function storeResults(PatientAssessment $attempt, AssessmentCategory $category): void
    {
        $answers = $attempt->answers()->with('question:id,sub_category_id')->get()
            ->map(fn ($a) => [
                'sub_category_id' => $a->question->sub_category_id !== null ? (int) $a->question->sub_category_id : null,
                'score' => (int) $a->score,
            ])->all();

        $subIds = $category->subCategories()->pluck('id')->map(fn ($id) => (int) $id)->all();

        $bands = $category->scoreBands()->get()->map(fn ($b) => [
            'sub_category_id' => $b->sub_category_id !== null ? (int) $b->sub_category_id : null,
            'min_score' => (int) $b->min_score,
            'max_score' => (int) $b->max_score,
            'label' => $b->label,
            'level' => $b->level,
            'interpretation' => $b->interpretation,
        ])->all();

        $rows = $this->calculator->calculate($answers, $subIds, $bands, $category->total_mode);

        $attempt->results()->delete();
        foreach ($rows as $row) {
            $attempt->results()->create($row);
        }
    }
}
