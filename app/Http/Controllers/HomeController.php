<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Order;
use App\Models\Promo;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use App\Services\DeliveryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $latitude = $request->query('lat');
        $longitude = $request->query('lng');
        $radius = 10; // ✅ Default search radius (10km)

        // ✅ Sorting & Filtering Parameters
        $sortBy = $request->query('sort_by', 'relevance'); // Default sorting: relevance
        $categoryId = $request->query('category'); // Category filter
        $rating4Plus = $request->query('rating_4_plus', false) === "true"; // ✅ Filter for rating 4+
        $serviceType = $request->query('service_type', 'all'); // ✅ Service type filter (delivery, pickup, or both)

        // ✅ Fetch Nearby Restaurants (Only If No Extra Filters Applied)
        if (!$categoryId && !$rating4Plus && $sortBy === 'relevance' && $serviceType === 'all') {
            $baseRestaurantsQuery = Restaurant::selectRaw("
                    id, name, slug, logo, banner_image, rating, status, service_type, restaurant_category_id, latitude, longitude,
                    (6371 * acos(cos(radians(?)) * cos(radians(latitude)) 
                    * cos(radians(longitude) - radians(?)) + sin(radians(?)) 
                    * sin(radians(latitude)))) AS distance
                ", [$latitude, $longitude, $latitude])
                ->with(['category:id,name,slug'])
                ->withCount(['reviews', 'orders'])
                ->havingRaw("distance <= ?", [$radius]); // ✅ Always filter nearby

            // ✅ Fetch All Nearby Restaurants
            $allRestaurants = $baseRestaurantsQuery->orderBy('distance', 'asc')->get();

            // ✅ 🔥 Fast Delivery: Nearest restaurants sorted by distance
            $fastDelivery = $allRestaurants->sortBy('distance')->take(6)->map(fn($r) => $this->formatRestaurant($r))->values();

            // ✅ 🔥 Explore Restaurants (Default Nearby)
            $exploreRestaurants = $allRestaurants->take(12)->map(fn($r) => $this->formatRestaurant($r))->values();

            // ✅ 🔥 Top Restaurants (Only Nearby)
            $topRestaurants = $allRestaurants->sortByDesc('rating')->take(6)->map(fn($r) => $this->formatRestaurant($r))->values();

            // ✅ 🔥 Order Again (Only If User Logged In)
            $orderAgain = [];
            if ($userId) {
                $orderAgain = Order::where('customer_id', $userId)
                    ->where('order_status', 'completed')
                    ->where('payment_status', 'paid')
                    ->selectRaw('restaurant_id, MAX(created_at) as latest_order')
                    ->groupBy('restaurant_id')
                    ->orderByDesc('latest_order')
                    ->with(['restaurant' => function ($query) use ($latitude, $longitude, $radius) {
                        $query->selectRaw("
                            id, name, slug, logo, banner_image, rating, status, latitude, longitude,
                            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) 
                            * cos(radians(longitude) - radians(?)) + sin(radians(?)) 
                            * sin(radians(latitude)))) AS distance
                        ", [$latitude, $longitude, $latitude])
                            ->withCount('reviews')
                            ->havingRaw("distance <= ?", [$radius]); // ✅ Filter by distance
                    }])
                    ->limit(5)
                    ->get()
                    ->map(fn($order) => $order->restaurant ? $this->formatRestaurant($order->restaurant) : null)
                    ->filter()
                    ->values();
            }

            return ResponseHelper::success("Home data retrieved", [
                'promos' => Promo::whereDate('valid_until', '>=', now())->get(['id', 'code', 'discount_percentage', 'discount_amount', 'minimum_order', 'valid_until']),
                'categories' => RestaurantCategory::select('id', 'name', 'slug')->get(),
                'order_again' => $orderAgain,
                'top_restaurants' => $topRestaurants,
                'fast_delivery' => $fastDelivery,
                'explore_restaurants' => $exploreRestaurants,
            ]);
        }

        // ✅ 🔥 Explore Restaurants with Filters (Only When Filters Exist)
        $exploreQuery = Restaurant::selectRaw("
            id, name, slug, logo, banner_image, rating, status, service_type, restaurant_category_id, latitude, longitude,
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) 
            * cos(radians(longitude) - radians(?)) + sin(radians(?)) 
            * sin(radians(latitude)))) AS distance
        ", [$latitude, $longitude, $latitude])
            ->with(['category:id,name,slug'])
            ->withCount(['reviews', 'orders'])
            ->havingRaw("distance <= ?", [$radius]); // ✅ Always fetch only nearby

        // ✅ Apply Category Filter (Supports Multiple Categories)
        if ($categoryId) {
            $categoryIds = explode(',', $categoryId);
            $exploreQuery->whereIn('restaurant_category_id', $categoryIds);
        }

        // ✅ Apply Service Type Filter (Delivery, Pickup, or Both)
        if ($serviceType !== 'all') {
            $exploreQuery->where('service_type', $serviceType);
        }

        // ✅ Apply Rating Filter (4+)
        if ($rating4Plus) {
            $exploreQuery->where('rating', '>=', 4);
        }

        // ✅ Apply Sorting
        if ($sortBy === 'top_rated') {
            $exploreQuery->orderByDesc('rating');
        } elseif ($sortBy === 'most_orders') {
            $exploreQuery->orderByDesc('orders_count');
        } elseif ($sortBy === 'fast_delivery') {
            $exploreQuery->orderBy('distance', 'asc');
        } else {
            $exploreQuery->orderBy('distance', 'asc'); // Default: nearest first
        }

        // ✅ Fetch & Format Explore Restaurants
        $exploreRestaurants = $exploreQuery->limit(12)->get()->map(fn($r) => $this->formatRestaurant($r))->values();

        return ResponseHelper::success("Explore restaurants retrieved", [
            'categories' => RestaurantCategory::select('id', 'name', 'slug')->get(),
            'explore_restaurants' => $exploreRestaurants,
        ]);
    }

    /**
     * ✅ Helper function to format restaurant data.
     */
    private function formatRestaurant($restaurant)
    {
        // ✅ Use SQL-calculated distance directly (no need to recalculate)
        $distance = round($restaurant->distance, 2);

        // ✅ Calculate delivery fee & estimated time based on correct distance
        $deliveryFee = DeliveryService::calculateDeliveryFee($distance);
        $estimatedTime = DeliveryService::estimateDeliveryTime($distance);

        return [
            'id' => $restaurant->id,
            'slug' => $restaurant->slug,
            'name' => $restaurant->name,
            'logo' => $restaurant->logo,
            'banner_image' => $restaurant->banner_image,
            'rating' => number_format($restaurant->rating, 1),
            'total_reviews' => $restaurant->reviews_count ?? 0,
            'is_open' => $restaurant->status === 'open',
            'distance_km' => $distance, // ✅ Now correctly using SQL distance
            'delivery_fee' => $deliveryFee,
            'estimated_time' => $estimatedTime,
        ];
    }



    /**
     * ✅ Fetch user's active order along with rider and customer address details
     */
    public function getCurrentOrder(Request $request)
    {
        $user = $request->user();

        $currentOrder = Order::with([
            'delivery' => function ($query) {
                $query->select(
                    'id',
                    'order_id',
                    'status',
                    'current_lat',
                    'current_lng',
                    'pickup_time',
                    'delivery_time'
                );
            },
            'customerAddress' => function ($query) {
                $query->select(
                    'id',
                    'address',
                    'latitude',
                    'longitude'
                );
            },
            'restaurant' => function ($query) {
                $query->select(
                    'id',
                    'name',
                    'address',
                    'latitude',
                    'longitude',
                    'phone_number'
                );
            },
            'rider' => function ($query) {
                $query->select(
                    'id',
                    'name',
                    'phone_number',
                    'profile_image'
                );
            }
        ])
            ->where('customer_id', $user->id)
            ->whereNotIn('order_status', ['completed', 'canceled'])
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$currentOrder) {
            return ResponseHelper::error('No active orders found', 404);
        }

        return ResponseHelper::success('Active order details fetched successfully', [
            'order_id'        => $currentOrder->id,
            'order_status'    => $currentOrder->order_status,
            'delivery_status' => optional($currentOrder->delivery)->status,
            'rider_location'  => [
                'lat' => optional($currentOrder->delivery)->current_lat,
                'lng' => optional($currentOrder->delivery)->current_lng,
            ],
            'customer_location' => [
                'address'   => optional($currentOrder->customerAddress)->address,
                'lat'       => optional($currentOrder->customerAddress)->latitude,
                'lng'       => optional($currentOrder->customerAddress)->longitude,
            ],
            'restaurant_location' => [
                'name'    => optional($currentOrder->restaurant)->name,
                'address' => optional($currentOrder->restaurant)->address,
                'lat'     => optional($currentOrder->restaurant)->latitude,
                'lng'     => optional($currentOrder->restaurant)->longitude,
                'phone'   => optional($currentOrder->restaurant)->phone,
            ],
            'rider' => [
                'name'          => optional($currentOrder->rider)->name,
                'phone'         => optional($currentOrder->rider)->phone,
                'profile_image' => optional($currentOrder->rider)->profile_image,
            ],
            'pickup_time'    => optional($currentOrder->delivery)->pickup_time,
            'delivery_time'  => optional($currentOrder->delivery)->delivery_time,
        ]);
    }
}
