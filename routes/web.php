<?php

use App\Events\MyEvent;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/reset-password', [AuthController::class, 'showResetForm'])->name('password.reset.form');
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/test-event', function () {

    event(new MyEvent('Hello world!'));
    return "Event broadcasted!";
});
