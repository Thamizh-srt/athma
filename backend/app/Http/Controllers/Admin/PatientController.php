<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PatientAssessment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

/** Admin: patient list and the profile block of the patient detail page. */
class PatientController extends Controller
{
    /** A patient counts as "active" if they registered or touched an assessment within this many days. */
    private const ACTIVE_DAYS = 30;

    public function index(): JsonResponse
    {
        $patients = Patient::query()
            ->withCount(['assessments as assessments_completed' => fn ($q) => $q->where('status', PatientAssessment::COMPLETED)])
            ->latest()
            ->get()
            ->map(fn (Patient $p) => $this->summary($p) + ['assessments_completed' => $p->assessments_completed]);

        return response()->json($patients);
    }

    public function show(Patient $patient): JsonResponse
    {
        $lastTouch = PatientAssessment::where('patient_id', $patient->id)->max('updated_at');
        $lastActivity = collect([$patient->created_at, $lastTouch ? Carbon::parse($lastTouch) : null])->filter()->max();

        return response()->json($this->summary($patient) + [
            'address' => $patient->address,
            'pincode' => $patient->pincode,
            'location' => $patient->location,
            'marital_status' => $patient->marital_status,
            'education' => $patient->education,
            'occupation' => $patient->occupation,
            'referred_by' => $patient->referred_by,
            'consented_at' => $patient->consented_at,
            'last_activity_at' => $lastActivity,
            'status' => $lastActivity && $lastActivity->gte(now()->subDays(self::ACTIVE_DAYS)) ? 'active' : 'inactive',
        ]);
    }

    private function summary(Patient $p): array
    {
        return [
            'id' => $p->id,
            'full_name' => $p->full_name,
            'age' => $p->age,
            'gender' => $p->gender,
            'phone' => $p->phone,
            'email' => $p->email,
            'city' => $p->city,
            'state' => $p->state,
            'created_at' => $p->created_at,
            'declaration_signed' => (bool) $p->consent,   // the React app calls the consent checkbox "declaration"
        ];
    }
}
