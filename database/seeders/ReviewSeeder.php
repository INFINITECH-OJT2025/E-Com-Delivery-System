<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        Review::create([
            'user_id' => 3,
            'restaurant_id' => 1,
            'rating' => 5,
            'comment' => 'Amazing cheeseburger, highly recommended!'
        ]);

        Review::create([
            'user_id' => 3,
            'restaurant_id' => 2,
            'rating' => 4,
            'comment' => 'Great service and delicious gourmet meals.'
        ]);
    }
}
