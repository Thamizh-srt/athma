<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\QuizController;
use App\Http\Controllers\Auth\PatientAuthController;
use App\Http\Controllers\AssessmentController;
use Illuminate\Support\Facades\Route;

// Patients
Route::prefix('auth')->group(function () {
    Route::post('register', [PatientAuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login', [PatientAuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware(['auth:sanctum', 'patient'])->group(function () {
        Route::post('logout', [PatientAuthController::class, 'logout']);
        Route::get('me', [PatientAuthController::class, 'me']);
    });
});

Route::middleware(['auth:sanctum', 'patient'])->prefix('assessments')->group(function () {
    Route::get('/', [AssessmentController::class, 'index']);
    Route::get('{category}', [AssessmentController::class, 'show']);
    Route::put('{category}/answers', [AssessmentController::class, 'saveAnswers']);
    Route::post('{category}/submit', [AssessmentController::class, 'submit']);
});

// Admin
Route::prefix('admin')->group(function () {
    Route::post('auth/login', [AdminAuthController::class, 'login'])->middleware('throttle:6,1');
    Route::get('/overview', [AdminDashboardController::class, 'overview']);
    Route::get('/patients', [AdminDashboardController::class, 'patient']);
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::get('/quizzes/{category}', [QuizController::class, 'show']);

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('auth/logout', [AdminAuthController::class, 'logout']);

        // Route::get('auth/me',      [AdminAuthController::class, 'me']);
        // future: Route::get('patients', ...), overview, quizzes
    });
});
