<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Restaurant;
use App\Models\Menu;
use App\Models\SearchHistory;
use App\Models\SearchKeyword;
use App\Services\DeliveryService;
use App\Services\RestaurantFilterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    /**
     * ✅ Search Restaurants (With Delivery Details & Similar Restaurants)
     */
    public function search(Request $request)
    {
        $query = trim($request->query('query'));
        $latitude = $request->query('lat');
        $longitude = $request->query('lng');
        $radius = 10; // ✅ Default search radius (10km)

        if (!$query) {
            return ResponseHelper::error("Search query cannot be empty", 400);
        }

        if (!$latitude || !$longitude) {
            return ResponseHelper::error("Location required for accurate search", 400);
        }

        // ✅ Extract Filters
        $filters = [
            'sort_by' => $request->query('sort_by', 'relevance'),
            'category' => $request->query('category'),
            'free_delivery' => filter_var($request->query('free_delivery', false), FILTER_VALIDATE_BOOLEAN),
            'accepts_vouchers' => filter_var($request->query('accepts_vouchers', false), FILTER_VALIDATE_BOOLEAN),
            'deal' => filter_var($request->query('deal', false), FILTER_VALIDATE_BOOLEAN),
            'rating_4_plus' => filter_var($request->query('rating_4_plus', false), FILTER_VALIDATE_BOOLEAN),
            'service_type' => $request->query('service_type', 'all'),
        ];

        // ✅ Track Search if User is Logged In
        if (Auth::check()) {
            SearchHistory::create(['user_id' => Auth::id(), 'query' => $query]);
        }

        // ✅ Track Popular Keywords
        SearchKeyword::incrementSearchCount($query);

        // ✅ Step 1: Search Restaurants (Full-Text & Location-Based)
        $restaurantQuery = Restaurant::whereRaw("MATCH(name, description, address) AGAINST(? IN BOOLEAN MODE)", [$query])
            ->selectRaw("
            id, name, slug, logo, banner_image, rating, status, service_type, restaurant_category_id, latitude, longitude,
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) 
            * cos(radians(longitude) - radians(?)) + sin(radians(?)) 
            * sin(radians(latitude)))) AS distance
        ", [$latitude, $longitude, $latitude])
            ->with(['category:id,name,slug'])
            ->withCount('reviews');

        // ✅ Step 2: Search Menu Items & Get Their Restaurants
        $menuRestaurantIds = Menu::whereRaw("MATCH(name, description) AGAINST(? IN BOOLEAN MODE)", [$query])
            ->pluck('restaurant_id')
            ->unique();

        if ($menuRestaurantIds->isNotEmpty()) {
            $restaurantQuery->orWhereIn('id', $menuRestaurantIds);
        }

        // ✅ Apply Filters & Sorting Using Service
        RestaurantFilterService::applyFilters($restaurantQuery, $filters);
        RestaurantFilterService::applySorting($restaurantQuery, $filters['sort_by'], $query);

        // ✅ Apply Distance Filter After Sorting
        $restaurantQuery->havingRaw("distance <= ?", [$radius]);

        // ✅ Get Restaurants
        $restaurants = $restaurantQuery->limit(10)->get();

        // ✅ Step 3: Find Similar Restaurants (Strict Matching)
        $similarRestaurants = Restaurant::whereIn('restaurant_category_id', $restaurants->pluck('restaurant_category_id'))
            ->whereNotIn('id', $restaurants->pluck('id'))
            ->whereRaw("restaurant_category_id IS NOT NULL") // Ensure category is defined
            ->withCount('reviews')
            ->limit(5)
            ->get();

        // ✅ Step 4: Find Restaurants Serving Related Menu Items (Fix Category Overlap)
        $menuCategories = Menu::whereIn('restaurant_id', $restaurants->pluck('id'))
            ->pluck('menu_category_id')
            ->unique();

        // 🔥 Fix: Ensure the menu items belong to **different restaurants**
        $restaurantsServingSimilarMenus = Restaurant::whereHas('menus', function ($query) use ($menuCategories, $restaurants) {
            $query->whereIn('menu_category_id', $menuCategories)
                ->whereNotIn('restaurant_id', $restaurants->pluck('id')); // Exclude already found restaurants
        })
            ->whereNotIn('id', $restaurants->pluck('id')) // Extra safety check
            ->whereRaw("restaurant_category_id IS NOT NULL") // Ensure it has a valid category
            ->withCount('reviews')
            ->limit(5)
            ->get();


        // ✅ Format Data with Delivery Information
        $formattedRestaurants = $restaurants->map(fn($r) => $this->formatRestaurant($r, $latitude, $longitude));
        $formattedSimilarRestaurants = $similarRestaurants->map(fn($r) => $this->formatRestaurant($r, $latitude, $longitude));
        $formattedRestaurantsServingSimilarMenus = $restaurantsServingSimilarMenus->map(fn($r) => $this->formatRestaurant($r, $latitude, $longitude));

        return ResponseHelper::success("Search results retrieved", [
            'restaurants' => $formattedRestaurants,
            'similar_restaurants' => $formattedSimilarRestaurants,
            'related_menu_restaurants' => $formattedRestaurantsServingSimilarMenus,
        ]);
    }

    /**
     * ✅ Format Restaurant Data (With Delivery Service)
     */
    private function formatRestaurant($restaurant, $userLat, $userLng)
    {
        // ✅ Use DeliveryService for Distance, Fee, and Estimated Time
        $distance = DeliveryService::calculateDistance($userLat, $userLng, $restaurant->latitude, $restaurant->longitude);
        $deliveryFee = DeliveryService::calculateDeliveryFee($distance, $restaurant->base_delivery_fee ?? 0);
        $estimatedTime = DeliveryService::estimateDeliveryTime($distance);

        return [
            'id' => $restaurant->id,
            'slug' => $restaurant->slug,
            'name' => $restaurant->name,
            'logo' => $restaurant->logo,
            'banner_image' => $restaurant->banner_image,
            'rating' => (float) number_format($restaurant->rating, 1), // ✅ Ensure rating is a number
            'total_reviews' => $restaurant->reviews_count ?? 0,
            'is_open' => $restaurant->status === 'open',
            'distance_km' => round($distance, 2),
            'delivery_fee' => $deliveryFee,
            'estimated_time' => $estimatedTime,
        ];
    }


    /**
     * ✅ Get Popular Searches
     */
    public function popularSearches()
    {
        $popularSearches = SearchKeyword::orderBy('search_count', 'desc')
            ->limit(10)
            ->pluck('keyword');

        return ResponseHelper::success("Popular searches retrieved", ['popular_searches' => $popularSearches]);
    }

    /**
     * ✅ Get Recent Searches (User Must Be Logged In)
     */
    public function recentSearches()
    {
        if (!Auth::check()) {
            return ResponseHelper::error("Unauthorized", 401);
        }

        $recentSearches = SearchHistory::where('user_id', Auth::id())
            ->latest()
            ->limit(5)
            ->pluck('query');

        return ResponseHelper::success("Recent searches retrieved", ['recent_searches' => $recentSearches]);
    }
    /**
     * ✅ Delete a Single Recent Search
     */
    public function deleteRecentSearch($query)
    {
        if (!Auth::check()) {
            return ResponseHelper::error("Unauthorized", 401);
        }

        // ✅ Decode URL query (fix for spaces)
        $decodedQuery = urldecode($query);

        // ✅ Ensure case-insensitive deletion
        $deleted = SearchHistory::where('user_id', Auth::id())
            ->whereRaw('LOWER(query) = LOWER(?)', [$decodedQuery])
            ->delete();

        if ($deleted) {
            return ResponseHelper::success("Search deleted successfully");
        } else {
            return ResponseHelper::error("Search not found", 404);
        }
    }

    /**
     * ✅ Clear All Recent Searches
     */
    public function clearAllRecentSearches()
    {
        if (!Auth::check()) {
            return ResponseHelper::error("Unauthorized", 401);
        }

        SearchHistory::where('user_id', Auth::id())->delete();

        return ResponseHelper::success("All recent searches cleared");
    }
}
