<?php

namespace Tests\Feature;

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Models\AssessmentCategory;
use App\Models\Patient;
use App\Models\PatientAssessment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_overview_uses_live_assessment_and_latest_patient_risk_data(): void
    {
        $now = now()->parse('2026-11-18 12:00:00');
        $this->travelTo($now);

        $patientA = $this->createPatient('patient-a');
        $patientB = $this->createPatient('patient-b');
        $patientC = $this->createPatient('patient-c');
        $categories = collect(['OLD', 'NEW', 'HIGH', 'EMPTY'])
            ->map(fn (string $code) => AssessmentCategory::create(['code' => $code, 'title' => $code]));

        $oldHigh = $this->createAssessment($patientA, $categories[0], '2026-11-10 10:00:00');
        $oldHigh->results()->create(['score' => 10, 'level' => 'high']);
        $latestLow = $this->createAssessment($patientA, $categories[1], '2026-11-17 10:00:00');
        $latestLow->results()->create(['score' => 2, 'level' => 'normal']);

        $high = $this->createAssessment($patientB, $categories[2], '2026-11-18 09:00:00');
        $high->results()->create(['score' => 9, 'level' => 'very_high']);
        $this->createAssessment($patientC, $categories[3], '2026-11-18 11:00:00', PatientAssessment::IN_PROGRESS);

        $response = app(AdminDashboardController::class)->overview();
        $data = $response->getData(true);

        $this->assertSame([
            'assessments_week' => 2,
            'assessments_change' => 100,
            'patients' => 3,
            'patients_month' => 3,
            'high_risk' => 1,
            'high_risk_waiting' => 1,
        ], $data['stats']);
        $this->assertSame(['low' => 1, 'moderate' => 0, 'high' => 1], $data['risk']);
        $this->assertCount(7, $data['by_day']);
        $this->assertSame([
            ['day' => 'Thu', 'count' => 0],
            ['day' => 'Fri', 'count' => 0],
            ['day' => 'Sat', 'count' => 0],
            ['day' => 'Sun', 'count' => 0],
            ['day' => 'Mon', 'count' => 0],
            ['day' => 'Tue', 'count' => 1],
            ['day' => 'Wed', 'count' => 1],
        ], $data['by_day']);
    }

    private function createPatient(string $suffix): Patient
    {
        return Patient::create([
            'full_name' => $suffix,
            'phone' => '9876543210',
            'email' => "$suffix@example.com",
            'address' => '1 Main Street',
            'city' => 'Chennai',
            'state' => 'Tamil Nadu',
            'pincode' => '600116',
            'location' => 'Chennai',
            'password' => 'secret12',
        ]);
    }

    private function createAssessment(
        Patient $patient,
        AssessmentCategory $category,
        string $completedAt,
        string $status = PatientAssessment::COMPLETED
    ): PatientAssessment {
        return PatientAssessment::create([
            'patient_id' => $patient->id,
            'category_id' => $category->id,
            'status' => $status,
            'started_at' => $completedAt,
            'completed_at' => $status === PatientAssessment::COMPLETED ? $completedAt : null,
        ]);
    }
}
