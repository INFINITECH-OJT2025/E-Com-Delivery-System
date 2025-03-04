<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;
use App\Helpers\ResponseHelper;

class RestaurantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $restaurants = Restaurant::select('id', 'name', 'slug', 'banner_image', 'rating', 'status', 'service_type', 'restaurant_category_id')
            ->with(['category:id,name,slug'])
            ->withCount('reviews')
            ->get();

        return ResponseHelper::success("Restaurants retrieved", $restaurants);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->with([
                'menus:id,restaurant_id,menu_category_id,name,price,image,availability',
                'menus.category:id,name',
                'reviews:id,restaurant_id,user_id,rating,comment,created_at',
                'category:id,name,slug',
            ])
            ->withCount('reviews')
            ->firstOrFail();

        // ✅ Get best sellers based on most ordered menu items
        $bestSellers = $restaurant->menus()
            ->select('menus.id', 'menus.restaurant_id', 'menus.menu_category_id', 'menus.name', 'menus.price', 'menus.image', 'menus.availability')
            ->leftJoin('order_items', 'menus.id', '=', 'order_items.menu_id') // ✅ Count menu items from orders
            ->groupBy('menus.id', 'menus.restaurant_id', 'menus.menu_category_id', 'menus.name', 'menus.price', 'menus.image', 'menus.availability')
            ->orderByRaw('COUNT(order_items.id) DESC') // ✅ Most ordered items first
            ->limit(5)
            ->get();

        return ResponseHelper::success("Restaurant data retrieved", [
            'restaurant' => $restaurant,
            'best_sellers' => $bestSellers,
            'menu_categories' => $restaurant->menus->pluck('category')->unique()->values(),
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Get the menu of a specific restaurant.
     */
    public function menu($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->with('menus:id,restaurant_id,name,price,image,availability')
            ->firstOrFail();

        return ResponseHelper::success("Menu retrieved", $restaurant->menus);
    }

    /**
     * Get the reviews of a specific restaurant.
     */
    public function reviews($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->with('reviews:id,restaurant_id,user_id,rating,comment,created_at')
            ->withCount('reviews')
            ->firstOrFail();

        return ResponseHelper::success("Reviews retrieved", [
            'reviews' => $restaurant->reviews,
            'total_reviews' => $restaurant->reviews_count
        ]);
    }
}
