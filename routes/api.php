<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    // ✅ Register & Verification
    Route::post('/register', [AuthController::class, 'register']); // Register
    Route::get('/verify/{token}', [AuthController::class, 'verifyEmail']); // Verify Email via Link
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']); // ✅ Throttle OTP Verification (5 attempts per minute)
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']); // ✅ Throttle Resend Requests (3 every 5 minutes)

    // ✅ Login & Logout
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // ✅ Throttle Login (5 attempts per minute)
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']); // Logout

    // ✅ Email Check (for frontend validation before signup)
    Route::post('/email-check', [AuthController::class, 'checkEmail'])->middleware('throttle:10,1'); // ✅ Throttle Email Check (10 per minute)

    // ✅ Protected Routes (Require Authentication)
    Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']); // Get Authenticated User
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
