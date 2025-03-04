<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        Menu::create([
            'restaurant_id' => 1,
            'menu_category_id' => 1,
            'name' => 'Cheeseburger',
            'slug' => 'cheeseburger-' . uniqid(),
            'description' => 'A delicious cheeseburger with 100% beef patty and cheese.',
            'price' => 120.00,
            'image' => 'cheeseburger.jpg',
            'availability' => 'in_stock'
        ]);

        Menu::create([
            'restaurant_id' => 1,
            'menu_category_id' => 2,
            'name' => 'Pepperoni Pizza',
            'slug' => 'pepperoni-pizza-' . uniqid(),
            'description' => 'Classic pepperoni pizza with mozzarella cheese.',
            'price' => 350.00,
            'image' => 'pepperoni_pizza.jpg',
            'availability' => 'in_stock'
        ]);

        Menu::create([
            'restaurant_id' => 2,
            'menu_category_id' => 3,
            'name' => 'Chocolate Lava Cake',
            'slug' => 'chocolate-lava-cake-' . uniqid(),
            'description' => 'Warm and gooey chocolate lava cake.',
            'price' => 200.00,
            'image' => 'lava_cake.jpg',
            'availability' => 'in_stock'
        ]);
    }
}
