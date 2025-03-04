<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Payment::create([
            'order_id' => 1,
            'user_id' => 3,
            'amount' => 590.00,
            'payment_method' => 'gcash',
            'payment_status' => 'success',
            'transaction_id' => 'GCASH123456'
        ]);
    }
}
