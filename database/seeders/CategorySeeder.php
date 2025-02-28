<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::create(['restaurant_id' => 1, 'name' => 'Burgers']);
        Category::create(['restaurant_id' => 1, 'name' => 'Pizzas']);
        Category::create(['restaurant_id' => 1, 'name' => 'Drinks']);
    }
}
