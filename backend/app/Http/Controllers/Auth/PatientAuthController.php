<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterPatientRequest;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PatientAuthController extends Controller
{
    public function register(RegisterPatientRequest $request): JsonResponse
    {
        $patient = Patient::create([
            ...$request->validated(),
            'consented_at' => now(),
        ]);

        return response()->json([
            'token' => $patient->createToken('patient')->plainTextToken,
            'user'  => $patient,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $patient = Patient::where('email', strtolower($request->email))->first();

        if (! $patient || ! Hash::check($request->password, $patient->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        return response()->json([
            'token' => $patient->createToken('patient')->plainTextToken,
            'user'  => $patient,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }
}