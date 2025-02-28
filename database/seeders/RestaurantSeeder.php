<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Restaurant::create([
            'owner_id' => 2, // Assuming user_id 2 is a restaurant owner
            'name' => 'Sample Restaurant',
            'description' => 'A test restaurant',
            'logo' => 'restaurant_logo.png',
            'banner_image' => 'restaurant_banner.jpg',
            'address' => '123 Food Street, City',
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'phone_number' => '09123456789',
            'status' => 'open',
            'rating' => 4.5
        ]);
    }
}
