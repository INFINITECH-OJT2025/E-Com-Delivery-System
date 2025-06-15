<?php

namespace Database\Seeders;

use App\Models\Promo;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
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

        Promo::create([
            'code' => 'FREESHIP50',
            'discount_percentage' => null,
            'discount_amount' => 50,
            'minimum_order' => 300,
            'max_uses' => 200,
            'valid_until' => now()->addDays(20)
        ]);
        Promo::create([
            'code' => 'WELCOME50',
            'discount_percentage' => 50,
            'discount_amount' => null,
            'minimum_order' => 200,
            'max_uses' => 1,
            'valid_until' => Carbon::now()->addDays(30),
        ]);
    }
}
