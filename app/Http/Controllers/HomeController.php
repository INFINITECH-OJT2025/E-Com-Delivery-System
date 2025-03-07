<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Promo;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $latitude = $request->query('lat'); // ✅ Get lat from query
        $longitude = $request->query('lng'); // ✅ Get lng from query
        $radius = 10; // ✅ Default radius (10km)

        // ✅ Base Query
        $restaurantsQuery = Restaurant::selectRaw("
                id, name, slug, banner_image, rating, status, service_type, restaurant_category_id,
                ( 6371 * acos( cos( radians(?) ) * cos( radians(latitude) ) 
                * cos( radians(longitude) - radians(?) ) + sin( radians(?) ) 
                * sin( radians(latitude) ) ) ) AS distance
            ", [$latitude, $longitude, $latitude]) // ✅ Haversine Formula
            ->with(['category:id,name,slug', 'reviews:id,restaurant_id'])
            ->withCount('reviews')
            ->where('status', 'open'); // ✅ Only fetch OPEN restaurants

        // ✅ Apply distance filter if lat/lng is provided
        if ($latitude && $longitude) {
            $restaurantsQuery->havingRaw("distance <= ?", [$radius]);
        }

        // ✅ Get restaurants with distance sorting
        $restaurants = $restaurantsQuery->orderBy('distance', 'asc')->get()->map(fn($restaurant) => [
            'id' => $restaurant->id,
            'slug' => $restaurant->slug,
            'name' => $restaurant->name,
            'banner_image' => $restaurant->banner_image,
            'rating' => number_format($restaurant->rating, 1),
            'total_reviews' => $restaurant->reviews_count ?? 0,
            'is_open' => $restaurant->status === 'open',
            'service_type' => $restaurant->service_type ?? 'both',
            'distance_km' => round($restaurant->distance, 2), // ✅ Add distance in km
            'category' => $restaurant->category ? [
                'id' => $restaurant->category->id,
                'name' => $restaurant->category->name,
                'slug' => $restaurant->category->slug
            ] : null,
        ]);

        return ResponseHelper::success("Nearby restaurants retrieved", [
            'promos' => Promo::whereDate('valid_until', '>=', now())->get(['id', 'code', 'discount_percentage', 'discount_amount', 'minimum_order', 'valid_until']),
            'categories' => RestaurantCategory::select('id', 'name', 'slug')->get(),
            'restaurants' => $restaurants,
        ]);
    }
}
