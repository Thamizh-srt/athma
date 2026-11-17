<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $admin = User::where('email', strtolower($request->email))
            ->where('is_admin', true)
            ->first();

        if (! $admin || ! Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid admin credentials.'],
            ]);
        }

        return response()->json([
            'token' => $admin->createToken('admin')->plainTextToken,
            'admin' => ['name' => $admin->name, 'email' => $admin->email],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $u = $request->user();
        return response()->json(['admin' => ['name' => $u->name, 'email' => $u->email]]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }
}