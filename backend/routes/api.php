<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Auth\PatientAuthController;
use Illuminate\Support\Facades\Route;

// Patients
Route::prefix('auth')->group(function () {
    Route::post('register', [PatientAuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login',    [PatientAuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware(['auth:sanctum', 'patient'])->group(function () {
        Route::post('logout', [PatientAuthController::class, 'logout']);
        Route::get('me',      [PatientAuthController::class, 'me']);
    });
});

// Admin
Route::prefix('admin')->group(function () {
    Route::post('auth/login', [AdminAuthController::class, 'login'])->middleware('throttle:6,1');
    Route::get('/overview', [AdminDashboardController::class, 'overview']);
    Route::get('/patients', [AdminDashboardController::class, 'patient']);

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('auth/logout', [AdminAuthController::class, 'logout']);

        // Route::get('auth/me',      [AdminAuthController::class, 'me']);
        // future: Route::get('patients', ...), overview, quizzes
    });
});