<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Refund;
use App\Models\Dispute;

class RefundDisputeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Refund::create([
            'order_id' => 1,
            'user_id' => 3,
            'status' => 'approved',
            'amount' => 120.00,
            'reason' => 'Wrong item delivered'
        ]);

        Dispute::create([
            'order_id' => 1,
            'user_id' => 3,
            'status' => 'resolved',
            'message' => 'Item was incorrect, but refund was processed successfully.'
        ]);
    }
}
