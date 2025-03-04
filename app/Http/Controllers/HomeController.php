<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Promo;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $restaurants = Restaurant::select('id', 'name', 'slug', 'banner_image', 'rating', 'status', 'service_type', 'restaurant_category_id')
            ->with(['category:id,name,slug', 'reviews:id,restaurant_id'])
            ->withCount('reviews')
            ->get()
            ->map(fn($restaurant) => [
                'id' => $restaurant->id,
                'slug' => $restaurant->slug,
                'name' => $restaurant->name,
                'banner_image' => $restaurant->banner_image,
                'rating' => number_format($restaurant->rating, 1),
                'total_reviews' => $restaurant->reviews_count ?? 0,
                'is_open' => $restaurant->status === 'open',
                'service_type' => $restaurant->service_type ?? 'both',
                'category' => $restaurant->category ? [
                    'id' => $restaurant->category->id,
                    'name' => $restaurant->category->name,
                    'slug' => $restaurant->category->slug
                ] : null,
            ]);

        return ResponseHelper::success("Home data retrieved", [
            'promos' => Promo::whereDate('valid_until', '>=', now())->get(['id', 'code', 'discount_percentage', 'discount_amount', 'minimum_order', 'valid_until']),
            'categories' => RestaurantCategory::select('id', 'name', 'slug')->get(), // ✅ Renamed `restaurant_categories` to `categories`
            'restaurants' => $restaurants,
        ]);
    }
}
