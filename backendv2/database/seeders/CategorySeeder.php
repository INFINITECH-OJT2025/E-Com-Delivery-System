<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RestaurantCategory;
use App\Models\MenuCategory;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed restaurant categories
        $restaurantCategories = [
            'Fast Food',
            'Fine Dining',
            'Café',
            'Bakery',
            'Casual Dining',
            'Buffet',
            'Food Truck',
            'Vegetarian/Vegan',
            'Barbecue',
            'Seafood'
        ];

        foreach ($restaurantCategories as $category) {
            RestaurantCategory::updateOrCreate(
                ['name' => $category],
                ['slug' => Str::slug($category)] // ✅ Generate unique slug
            );
        }

        // Seed menu categories
        $menuCategories = [
            'Burgers',
            'Pizzas',
            'Desserts',
            'Beverages',
            'Appetizers',
            'Main Course',
            'Salads',
            'Pasta',
            'Seafood Dishes',
            'Vegetarian Options'
        ];

        foreach ($menuCategories as $category) {
            MenuCategory::updateOrCreate(
                ['name' => $category],
                ['slug' => Str::slug($category)] // ✅ Generate unique slug
            );
        }
    }
}
