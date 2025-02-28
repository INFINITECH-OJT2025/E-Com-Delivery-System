<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Menu::create([
            'restaurant_id' => 1,
            'category_id' => 1,
            'name' => 'Cheeseburger',
            'description' => 'A delicious cheeseburger',
            'price' => 120.00,
            'image' => 'cheeseburger.jpg',
            'availability' => 'in_stock'
        ]);

        Menu::create([
            'restaurant_id' => 1,
            'category_id' => 2,
            'name' => 'Pepperoni Pizza',
            'description' => 'Classic pepperoni pizza',
            'price' => 350.00,
            'image' => 'pepperoni_pizza.jpg',
            'availability' => 'in_stock'
        ]);
    }
}
