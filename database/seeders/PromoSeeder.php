<?php

namespace Database\Seeders;

use App\Models\Promo;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Promo::create([
            'code' => 'DISCOUNT10',
            'discount_percentage' => 10,
            'discount_amount' => null,
            'minimum_order' => 500,
            'max_uses' => 100,
            'valid_until' => now()->addDays(30)
        ]);
    }
}
