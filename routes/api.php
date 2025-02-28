<?php

use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']); // ✅ Register
    Route::get('/verify/{token}', [AuthController::class, 'verifyEmail']); // ✅ Verify Email
    Route::post('/send-verification', [AuthController::class, 'resendVerificationEmail']); // ✅ Resend Email
    Route::post('/email-check', [AuthController::class, 'checkEmail']); // ✅ Check Email

    Route::post('/login', [AuthController::class, 'login']); // ✅ Login
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']); // ✅ Logout
    Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']); // ✅ Get Authenticated User
});


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
