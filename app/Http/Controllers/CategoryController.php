<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\RestaurantCategory;
use App\Models\MenuCategory;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * ✅ Get All Restaurant Categories
     */
    public function getRestaurantCategories()
    {
        return ResponseHelper::success("Restaurant categories retrieved", [
            'categories' => RestaurantCategory::select('id', 'name', 'slug')->get()
        ]);
    }

    /**
     * ✅ Get All Menu Categories
     */
    public function getMenuCategories()
    {
        return ResponseHelper::success("Menu categories retrieved", [
            'categories' => MenuCategory::select('id', 'name', 'slug')->get()
        ]);
    }

    /**
     * ✅ Get Both Restaurant & Menu Categories (For Global Use)
     */
    public function getAllCategories()
    {
        return ResponseHelper::success("All categories retrieved", [
            'restaurant_categories' => RestaurantCategory::select('id', 'name', 'slug')->get(),
            'menu_categories' => MenuCategory::select('id', 'name', 'slug')->get(),
        ]);
    }
}
