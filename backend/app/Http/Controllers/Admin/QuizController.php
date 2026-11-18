<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AssessmentCategory;
use App\Support\AssessmentPresenter as P;
use Illuminate\Http\JsonResponse;

class QuizController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            AssessmentCategory::withCount('questions')->orderBy('sort_order')->get()->map(fn ($c) => $this->summary($c))
        );
    }

    public function show(AssessmentCategory $category): JsonResponse
    {
        $category->loadCount('questions')->load(['subCategories', 'questions.options']);

        return response()->json($this->summary($category) + [
            'instructions' => P::pair($category->instructions, $category->instructions_ta),
            'min_score' => $category->min_score,
            'max_score' => $category->max_score,
            'total_mode' => $category->total_mode,
            'sub_categories' => $category->subCategories->map(fn ($s) => [
                'id' => $s->id,
                'code' => $s->code,
                'name' => P::pair($s->name, $s->name_ta),
                'description' => $s->description,
                'min_score' => $s->min_score,
                'max_score' => $s->max_score,
            ])->values(),
            'bands' => $category->scoreBands()->get(['sub_category_id', 'min_score', 'max_score', 'label', 'level']),
            'questions' => $category->questions->map(fn ($q) => P::question($q, admin: true))->values(),
        ]);
    }

    private function summary(AssessmentCategory $c): array
    {
        return [
            'id' => $c->id,
            'code' => $c->code,
            'title' => $c->title,
            'category' => $c->domain,
            'description' => $c->description,
            'status' => $c->is_active ? 'active' : 'inactive',
            'questions_count' => $c->questions_count,
            'created_at' => $c->created_at,
        ];
    }
}
