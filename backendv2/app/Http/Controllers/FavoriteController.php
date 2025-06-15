<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Favorite;
use App\Helpers\ResponseHelper;
use App\Models\Restaurant;
use App\Services\DeliveryService;

class FavoriteController extends Controller
{
    /**
     * ✅ Fetch all favorites of the authenticated user (Show Out-of-Range but Disabled)
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        if (!$userId) {
            return ResponseHelper::error("Unauthorized", 401);
        }

        // ✅ Get user's latitude & longitude from request
        $userLat = $request->query('lat');
        $userLng = $request->query('lng');

        if (!$userLat || !$userLng) {
            return ResponseHelper::error("User location is required", 400);
        }

        // ✅ Set max delivery distance (Example: 10km)
        $maxDistance = 10;

        // ✅ Fetch user favorites with related model (restaurant or menu)
        $favorites = Favorite::where('user_id', $userId)
            ->with('favoritable')
            ->get()
            ->map(function ($favorite) use ($userLat, $userLng, $maxDistance) {
                $item = $favorite->favoritable;
                if (!$item) return null; // ✅ Ensure item exists

                if ($favorite->favoritable_type === "restaurant") {
                    // ✅ Calculate restaurant distance, delivery fee, and estimated time
                    $distance = DeliveryService::calculateDistance($userLat, $userLng, $item->latitude, $item->longitude);
                    $deliveryFee = DeliveryService::calculateDeliveryFee($distance); // ✅ Use default ₱49 base
                    $estimatedTime = DeliveryService::estimateDeliveryTime($distance);

                    return [
                        'id' => $favorite->id, // Favorite ID
                        'favoritable_type' => "restaurant",
                        'favoritable_id' => $item->id, // ✅ Send the correct Restaurant ID
                        'name' => $item->name,
                        'slug' => $item->slug,
                        'logo' => $item->logo,
                        'banner_image' => $item->banner_image,
                        'rating' => number_format($item->rating, 1),
                        'total_reviews' => $item->reviews_count ?? 0, // ✅ Ensures correct total_reviews
                        'is_open' => $item->status === 'open',
                        'distance_km' => round($distance, 2),
                        'delivery_fee' => $deliveryFee, // ✅ Include delivery fee
                        'estimated_time' => $estimatedTime, // ✅ Include estimated delivery time
                        'is_in_range' => $distance <= $maxDistance, // ✅ Mark out-of-range restaurants
                        'restaurant_id' => $item->id, // ✅ Ensure correct restaurant ID
                        'restaurant_category_id' => $item->restaurant_category_id, // ✅ Include category for similar restaurants
                    ];
                } else {
                    // ✅ Menu items don’t need distance calculation
                    return [
                        'id' => $favorite->id,
                        'favoritable_type' => "menu",
                        'favoritable_id' => $item->id,
                        'name' => $item->name,
                        'image' => $item->image,
                        'price' => $item->price,
                        'restaurant_id' => $item->restaurant_id, // ✅ Ensure restaurant_id is included
                    ];
                }
            })
            ->filter()
            ->values();

        // ✅ Step 2: Find Similar Restaurants Based on All Favorites
        $favoriteCategories = collect($favorites)->pluck('restaurant_category_id')->unique(); // ✅ Use category like search API
        $favoriteRestaurantIds = collect($favorites)->pluck('restaurant_id')->unique(); // ✅ Store favorite restaurant IDs

        if ($favoriteCategories->isNotEmpty()) {
            $similarRestaurants = Restaurant::selectRaw("
    id, name, slug, logo, banner_image, rating, status, service_type, restaurant_category_id, latitude, longitude,
    (6371 * acos(cos(radians(?)) * cos(radians(latitude)) 
    * cos(radians(longitude) - radians(?)) + sin(radians(?)) 
    * sin(radians(latitude)))) AS distance
", [$userLat, $userLng, $userLat])
                ->whereIn('restaurant_category_id', $favoriteCategories) // ✅ Filter by category
                ->whereNotIn('id', $favoriteRestaurantIds) // ✅ Exclude favorited restaurants
                ->havingRaw("distance <= ?", [$maxDistance]) // ✅ Apply max distance filter
                ->limit(5)
                ->get()
                ->map(function ($r) {
                    return [
                        'restaurant_id' => $r->id,
                        'name' => $r->name,
                        'slug' => $r->slug,
                        'logo' => $r->logo,
                        'banner_image' => $r->banner_image,
                        'rating' => number_format($r->rating, 1),
                        'total_reviews' => 0, // ✅ Default if not available
                        'status' => $r->status,
                        'service_type' => $r->service_type,
                        'distance_km' => round($r->distance, 2),
                        'delivery_fee' => DeliveryService::calculateDeliveryFee($r->distance), // ✅ Use DeliveryService directly
                        'estimated_time' => DeliveryService::estimateDeliveryTime($r->distance), // ✅ Estimate delivery time
                    ];
                })
                ->values();
        } else {
            $similarRestaurants = [];
        }

        return ResponseHelper::success("Favorites retrieved successfully", [
            'favorites' => $favorites,
            'similar_restaurants' => $similarRestaurants, // ✅ Now sending restaurant IDs correctly
        ]);
    }



    /**
     * ✅ Add an item to favorites
     */
    public function store(Request $request)
    {
        $request->validate([
            'favoritable_type' => 'required|in:menu,restaurant',
            'favoritable_id' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) use ($request) {
                    // Dynamically determine model based on favoritable_type
                    $modelClass = $request->favoritable_type === 'menu'
                        ? \App\Models\Menu::class
                        : \App\Models\Restaurant::class;

                    // Check if the record exists
                    if (!$modelClass::where('id', $value)->exists()) {
                        $fail("The selected $request->favoritable_type does not exist.");
                    }
                }
            ]
        ]);

        $user = Auth::user();

        // ✅ Check if already favorited
        $existingFavorite = Favorite::where([
            'user_id' => $user->id,
            'favoritable_type' => $request->favoritable_type,
            'favoritable_id' => $request->favoritable_id
        ])->first();

        if ($existingFavorite) {
            return ResponseHelper::error("Already in favorites", 400);
        }

        $favorite = Favorite::create([
            'user_id' => $user->id,
            'favoritable_type' => $request->favoritable_type,
            'favoritable_id' => $request->favoritable_id
        ]);

        return ResponseHelper::success("Added to favorites", $favorite);
    }


    /**
     * ✅ Remove an item from favorites
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $favorite = Favorite::where('favoritable_id', $id)->where('user_id', $user->id)->first();

        if (!$favorite) {
            return ResponseHelper::error("Favorite not found", 404);
        }

        $favorite->delete();
        return ResponseHelper::success("Removed from favorites");
    }
}
