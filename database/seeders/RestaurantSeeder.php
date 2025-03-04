<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        // Find a restaurant owner, or create one if none exist
        $owner = User::where('role', 'restaurant_owner')->first();

        if (!$owner) {
            $owner = User::create([
                'name' => 'Default Restaurant Owner',
                'email' => 'owner@example.com',
                'password' => bcrypt('password'),
                'phone_number' => '09121234567',
                'role' => 'restaurant_owner',
            ]);
        }

        Restaurant::create([
            'owner_id' => $owner->id,
            'name' => 'Fast Bites',
            'slug' => 'fast-bites-' . uniqid(),
            'restaurant_category_id' => 1,
            'description' => 'Quick and tasty fast food.',
            'logo' => 'fast_bites_logo.png',
            'banner_image' => 'fast_bites_banner.jpg',
            'address' => '123 Main Street, City',
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'phone_number' => '09123456789',
            'status' => 'open',
            'rating' => 4.7,
            'service_type' => 'both'
        ]);

        Restaurant::create([
            'owner_id' => $owner->id,
            'name' => 'Gourmet Delights',
            'slug' => 'gourmet-delights-' . uniqid(),
            'restaurant_category_id' => 2,
            'description' => 'Fine dining experience with exquisite dishes.',
            'logo' => 'gourmet_logo.png',
            'banner_image' => 'gourmet_banner.jpg',
            'address' => '45 Luxury Lane, City',
            'latitude' => 14.6000,
            'longitude' => 120.9850,
            'phone_number' => '09127896543',
            'status' => 'open',
            'rating' => 4.9,
            'service_type' => 'delivery'
        ]);
    }
}
