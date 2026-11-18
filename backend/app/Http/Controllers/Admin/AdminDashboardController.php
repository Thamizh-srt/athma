<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PatientAssessment;
use Illuminate\Database\Eloquent\Builder;

class AdminDashboardController extends Controller
{
    public function overview()
    {
        $now = now();
        $thisWeekStart = $now->copy()->startOfWeek();
        $lastWeekStart = $thisWeekStart->copy()->subWeek();

        $totalPatients = Patient::count();
        $thisMonthPatients = Patient::whereBetween('created_at', [$now->copy()->startOfMonth(), $now])
            ->count();

        $completed = PatientAssessment::query()
            ->where('status', PatientAssessment::COMPLETED)
            ->whereNotNull('completed_at');
        $assessmentsThisWeek = (clone $completed)
            ->whereBetween('completed_at', [$thisWeekStart, $now])
            ->count();
        $assessmentsLastWeek = (clone $completed)
            ->where('completed_at', '>=', $lastWeekStart)
            ->where('completed_at', '<', $thisWeekStart)
            ->count();
        $risk = $this->latestPatientRiskLevels($completed);

        $stats = [
            'assessments_week' => $assessmentsThisWeek,
            'assessments_change' => $assessmentsLastWeek > 0
                ? (int) round(($assessmentsThisWeek - $assessmentsLastWeek) / $assessmentsLastWeek * 100)
                : ($assessmentsThisWeek > 0 ? 100 : 0),
            'patients' => $totalPatients,
            'patients_month' => $thisMonthPatients,
            'high_risk' => $risk['high'],
            'high_risk_waiting' => $risk['high'],
        ];

        $firstDay = $now->copy()->startOfDay()->subDays(6);
        $dailyCounts = (clone $completed)
            ->whereBetween('completed_at', [$firstDay, $now])
            ->selectRaw('DATE(completed_at) as completed_day, COUNT(*) as aggregate')
            ->groupBy('completed_day')
            ->pluck('aggregate', 'completed_day');
        $by_day = collect(range(0, 6))->map(function (int $offset) use ($firstDay, $dailyCounts) {
            $date = $firstDay->copy()->addDays($offset);

            return ['day' => $date->format('D'), 'count' => (int) $dailyCounts->get($date->toDateString(), 0)];
        })->all();

        return response()->json([
            'stats' => $stats,
            'by_day' => $by_day,
            'risk' => $risk
        ]);
    }

    /**
     * Count each patient once, using their latest completed assessment. If it has a total
     * score, use that level; otherwise use the highest level among its sub-category results.
     *
     * @return array{low: int, moderate: int, high: int}
     */
    private function latestPatientRiskLevels(Builder $completed): array
    {
        $latestAttempts = (clone $completed)
            ->whereNotExists(function ($query) {
                $query->selectRaw('1')
                    ->from('patient_assessments as newer')
                    ->whereColumn('newer.patient_id', 'patient_assessments.patient_id')
                    ->where('newer.status', PatientAssessment::COMPLETED)
                    ->whereNotNull('newer.completed_at')
                    ->where(function ($query) {
                        $query->whereColumn('newer.completed_at', '>', 'patient_assessments.completed_at')
                            ->orWhere(function ($query) {
                                $query->whereColumn('newer.completed_at', 'patient_assessments.completed_at')
                                    ->whereColumn('newer.id', '>', 'patient_assessments.id');
                            });
                    });
            })
            ->with('results')
            ->get();

        $counts = ['low' => 0, 'moderate' => 0, 'high' => 0];

        foreach ($latestAttempts as $attempt) {
            $totalResult = $attempt->results->firstWhere('sub_category_id', null);
            $levels = $totalResult
                ? collect([$totalResult->level])
                : $attempt->results->pluck('level');
            $risk = $levels
                ->map(fn (?string $level) => $this->normalizeRiskLevel($level))
                ->filter()
                ->sortBy(fn (string $level) => ['low' => 1, 'moderate' => 2, 'high' => 3][$level])
                ->last();

            if ($risk !== null) {
                $counts[$risk]++;
            }
        }

        return $counts;
    }

    private function normalizeRiskLevel(?string $level): ?string
    {
        return match ($level) {
            'very_low', 'low', 'normal' => 'low',
            'moderate' => 'moderate',
            'high', 'very_high' => 'high',
            default => null,
        };
    }

    public function patient(){
        $patient = Patient::select('id','full_name','phone','location','created_at')->paginate(env('PAGINATION_LIMIT', 20));

        return response()->json([
            'patients' => $patient
        ]);
    }

    public function quizzes(){
        $patient = Patient::select('id','full_name','phone','location','created_at')->paginate(env('PAGINATION_LIMIT', 20));

        return response()->json([
            'patients' => $patient
        ]);
    }
}
