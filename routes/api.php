<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CustomerAddressController;
use App\Http\Controllers\GoogleMapsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\UserController;


use Illuminate\Support\Facades\Http;

Route::prefix('google-maps')->group(function () {
    Route::get('/geocode', [GoogleMapsController::class, 'getAddressFromCoords']);
    Route::get('/distance', [GoogleMapsController::class, 'getDistance']);
    Route::get('/autocomplete', [GoogleMapsController::class, 'getAutocompleteResults']);
});

// ✅ Authentication Routes (Sanctum Token-Based)
Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('auth.logout');

// ✅ Check Email (Throttled to prevent abuse)
Route::post('/email-check', [AuthController::class, 'checkEmail'])
    ->middleware('throttle:10,1')
    ->name('auth.email-check');

// ✅ Get Authenticated User (Protected)
Route::middleware('auth:sanctum')->group(function () {
    // ✅ Authenticated User Details (Move to AuthController)
    Route::get('/user', [AuthController::class, 'me'])->name('auth.user');

    // ✅ User Management (Only for Admins)
    Route::apiResource('users', UserController::class)->except(['create', 'edit']);
});


// ✅ Public Routes
Route::get('/home', [HomeController::class, 'index'])->name('home.index');

// ✅ Restaurant Routes
Route::prefix('restaurants')->group(function () {
    Route::get('/{slug}', [RestaurantController::class, 'show'])->name('restaurants.show');
    Route::get('/{slug}/menu', [RestaurantController::class, 'menu'])->name('restaurants.menu');
    Route::get('/{slug}/reviews', [RestaurantController::class, 'reviews'])->name('restaurants.reviews');
});

// ✅ Protected Routes (Require Authentication)
Route::middleware('auth:sanctum')->group(function () {
    // 🛒 Cart API (Refactored to use `apiResource`)
    Route::apiResource('cart', CartController::class)->except(['create', 'edit']);

    Route::post('/checkout', [OrderController::class, 'checkout'])->name('order.checkout');
});
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::apiResource('addresses', CustomerAddressController::class)->except(['create', 'edit']);
    Route::patch('addresses/{id}/set-default', [CustomerAddressController::class, 'setDefault']);
});
