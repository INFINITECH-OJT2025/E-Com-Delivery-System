<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Notification;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Notification::create([
            'user_id' => 3, // Customer
            'message' => 'Your order has been confirmed!',
            'type' => 'order_update',
            'is_read' => false
        ]);

        Notification::create([
            'user_id' => 3,
            'message' => 'A new promo is available for your next order!',
            'type' => 'promo',
            'is_read' => false
        ]);
    }
}
