<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// // ✅ Make 'orders' a PUBLIC channel (no authentication needed)
// Broadcast::channel('orders', function () {
//     return true; // ✅ Anyone can subscribe
// });
Broadcast::channel('my-channel', function () {
    return true; // Allow all authenticated users to listen
});
