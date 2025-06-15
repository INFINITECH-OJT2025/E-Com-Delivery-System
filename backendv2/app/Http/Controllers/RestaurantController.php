<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;
use App\Helpers\ResponseHelper;
use App\Models\RestaurantCategory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

use Illuminate\Support\Facades\Validator;

class RestaurantController extends Controller
{
    /**
     * ✅ Get all restaurants (Basic listing with categories & review count)
     */
    public function index()
    {
        $restaurants = Restaurant::select('id', 'name', 'slug', 'banner_image', 'rating', 'status', 'service_type', 'restaurant_category_id')
            ->with(['category:id,name,slug'])
            ->withCount('reviews')
            ->paginate(10); // ✅ Pagination for performance

        return ResponseHelper::success("Restaurants retrieved", $restaurants);
    }

    /**
     * ✅ Create a new restaurant
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:restaurants,name',
            'slug' => 'required|string|max:255|unique:restaurants,slug',
            'banner_image' => 'nullable|url',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => ['required', Rule::in(['open', 'closed'])],
            'service_type' => ['required', Rule::in(['delivery', 'pickup', 'both'])],
            'restaurant_category_id' => 'required|exists:restaurant_categories,id',
        ]);

        $restaurant = Restaurant::create($validated);

        return ResponseHelper::success("Restaurant created successfully", $restaurant);
    }

    /**
     * ✅ Get full restaurant details (including menus, reviews, categories, best sellers)
     */
    public function show($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->with([
                'menus:id,restaurant_id,menu_category_id,name,price,image,availability,description',
                'menus.category:id,name',
                'reviews:id,restaurant_id,user_id,rating,comment,created_at',
                'category:id,name,slug',
            ])
            ->withCount('reviews')
            ->firstOrFail();

        // ✅ Get best sellers specific to this restaurant
        $bestSellers = $restaurant->menus()
            ->select('menus.id', 'menus.restaurant_id', 'menus.menu_category_id', 'menus.name', 'menus.price', 'menus.image', 'menus.availability', 'menus.description')
            ->leftJoin('order_items', 'menus.id', '=', 'order_items.menu_id')
            ->groupBy('menus.id', 'menus.restaurant_id', 'menus.menu_category_id', 'menus.name', 'menus.price', 'menus.image', 'menus.availability', 'menus.description')
            ->orderByRaw('COUNT(order_items.id) DESC')
            ->limit(5)
            ->get();

        // ✅ Extract unique menu categories
        $menuCategories = $restaurant->menus->pluck('category')->unique()->values();

        $restaurant->setAttribute('best_sellers', $bestSellers);
        $restaurant->setAttribute('menu_categories', $menuCategories);

        return ResponseHelper::success("Restaurant data retrieved", $restaurant);
    }

    /**
     * ✅ Update a restaurant
     */
    public function update(Request $request, $id)
    {
        $restaurant = Restaurant::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:restaurants,name,' . $restaurant->id,
            'slug' => 'sometimes|string|max:255|unique:restaurants,slug,' . $restaurant->id,
            'banner_image' => 'nullable|url',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => ['sometimes', Rule::in(['open', 'closed'])],
            'service_type' => ['sometimes', Rule::in(['delivery', 'pickup', 'both'])],
            'restaurant_category_id' => 'sometimes|exists:restaurant_categories,id',
        ]);

        $restaurant->update($validated);

        return ResponseHelper::success("Restaurant updated successfully", $restaurant);
    }

    /**
     * ✅ Delete a restaurant
     */
    public function destroy($id)
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->delete();

        return ResponseHelper::success("Restaurant deleted successfully");
    }

    /**
     * ✅ Get all menu items of a restaurant
     */
    public function menu($slug)
    {
        $menus = Restaurant::where('slug', $slug)
            ->with('menus:id,restaurant_id,name,price,image,availability')
            ->firstOrFail()
            ->menus;

        return ResponseHelper::success("Menu retrieved", $menus);
    }

    /**
     * ✅ Get reviews for a specific restaurant
     */
    public function reviews($slug)
    {
        $restaurant = Restaurant::where('slug', $slug)
            ->with('reviews:id,restaurant_id,user_id,rating,comment,created_at')
            ->withCount('reviews')
            ->firstOrFail();

        return ResponseHelper::success("Reviews retrieved", [
            'reviews' => $restaurant->reviews,
            'total_reviews' => $restaurant->reviews_count,
        ]);
    }

    // Get restaurant details
    public function getDetails(Request $request)
    {
        $vendor = $request->user(); // Get authenticated vendor
        $restaurant = Restaurant::where('owner_id', $vendor->id)->firstOrFail();
        return response()->json($restaurant);
    }

    public function updateDetails(Request $request)
    {
        $vendor = $request->user();

        $restaurant = Restaurant::where('owner_id', $vendor->id)->firstOrFail();

        $logoPath = $restaurant->logo;
        $bannerPath = $restaurant->banner_image;
        $storageDisk = 'public';

        // ✅ Handle logo upload
        if ($request->hasFile('logo')) {
            if ($restaurant->logo && Storage::disk($storageDisk)->exists($restaurant->logo)) {
                Storage::disk($storageDisk)->delete($restaurant->logo);
            }
            $logoPath = $request->file('logo')->store('restaurants', $storageDisk);
        }

        // ✅ Handle banner upload
        if ($request->hasFile('banner_image')) {
            if ($restaurant->banner_image && Storage::disk($storageDisk)->exists($restaurant->banner_image)) {
                Storage::disk($storageDisk)->delete($restaurant->banner_image);
            }
            $bannerPath = $request->file('banner_image')->store('restaurants', $storageDisk);
        }

        // ✅ Check if custom category should be created
        $categoryId = $request->input('restaurant_category_id');

        if (is_null($categoryId) && $request->filled('custom_category_name')) {
            $categoryName = trim($request->input('custom_category_name'));
            $existing = RestaurantCategory::where('name', $categoryName)->first();

            if ($existing) {
                $categoryId = $existing->id;
            } else {
                $newCategory = RestaurantCategory::create([
                    'name' => $categoryName,
                    // slug is auto-generated in model boot()
                ]);
                $categoryId = $newCategory->id;
            }
        }

        // ✅ Update restaurant fields
        $restaurant->update([
            'name' => $request->input('name', $restaurant->name),
            'description' => $request->input('description', $restaurant->description),
            'phone_number' => $request->input('phone_number', $restaurant->phone_number),
            'status' => $request->input('status', $restaurant->status),
            'restaurant_category_id' => $categoryId,
            'service_type' => $request->input('service_type', $restaurant->service_type),
            'minimum_order_for_delivery' => $request->input('minimum_order_for_delivery', $restaurant->minimum_order_for_delivery),
            'logo' => $logoPath,
            'banner_image' => $bannerPath,
            'visibility' => $request->input('visibility', $restaurant->visibility),
            'custom_schedule_json' => $request->input('custom_schedule_json', $restaurant->custom_schedule_json),
        ]);

        return response()->json([
            'message' => 'Restaurant details updated successfully.',
            'logo_url' => Storage::url($logoPath),
            'banner_url' => Storage::url($bannerPath),
        ]);
    }




    // Get restaurant categories
    public function getCategories()
    {
        $categories = RestaurantCategory::all();
        return response()->json($categories);
    }
    public function getById($id)
    {
        $restaurant = Restaurant::find($id);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $restaurant->id,
                'name' => $restaurant->name,
                'slug' => $restaurant->slug,
                'order_types' => $this->getOrderTypes($restaurant),
            ],
        ]);
    }
    private function getOrderTypes($restaurant)
    {
        switch ($restaurant->service_type) {
            case 'delivery':
                return ['delivery'];
            case 'pickup':
                return ['pickup'];
            case 'both':
                return ['delivery', 'pickup'];
            default:
                return [];
        }
    }
}
