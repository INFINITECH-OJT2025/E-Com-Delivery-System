<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class MenuController extends Controller
{
    /**
     * ✅ Fetch all menu items for the authenticated vendor
     */
    public function getMenu(Request $request)
    {
        $vendor = $request->user();
        $menuItems = Menu::whereHas('restaurant', function ($query) use ($vendor) {
            $query->where('owner_id', $vendor->id);
        })->get();

        return response()->json($menuItems);
    }

    /**
     * ✅ Create a new menu item
     */
    public function createMenu(Request $request)
    {
        $vendor = auth()->user(); // ✅ Correct way to get authenticated user

        if (!$vendor) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $restaurant = Restaurant::where('owner_id', $vendor->id)->firstOrFail();

        if (!$restaurant) {
            return response()->json(['error' => 'You do not have a registered restaurant'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'menu_category_id' => 'required|exists:menu_categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
            'stock' => 'required|integer|min:0'
        ]);

        // ✅ Handle image upload properly
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('menus', 'public'); // ✅ Corrected directory
        }

        $menu = Menu::create([
            'restaurant_id' => $restaurant->id,
            'menu_category_id' => $validated['menu_category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . uniqid(),
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image' => $imagePath,
            'stock' => $validated['stock'],
            'availability' => $validated['stock'] > 0 ? 'in_stock' : 'out_of_stock',
        ]);

        return response()->json(['message' => 'Menu item added successfully', 'menu' => $menu], 201);
    }


    /**
     * ✅ Update a menu item
     */
    public function updateMenu(Request $request, $id)
    {
        $vendor = $request->user();
        $menu = Menu::whereHas('restaurant', function ($query) use ($vendor) {
            $query->where('owner_id', $vendor->id);
        })->where('id', $id)->firstOrFail();

        $request->validate([
            'name' => 'nullable|string|max:255',
            'menu_category_id' => 'nullable|exists:menu_categories,id',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',

            'stock' => 'nullable|integer|min:0'
        ]);

        // ✅ Only update the image if a new one is uploaded
        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($menu->image && Storage::exists('public/menus/' . $menu->image)) {
                Storage::delete('public/menus/' . $menu->image);
            }
            // Store new image
            $menu->image = $request->file('image')->store('menus', 'public');
        }

        // ✅ Update menu details without changing the image if it's null
        $menu->update([
            'name' => $request->name ?? $menu->name,
            'menu_category_id' => $request->menu_category_id ?? $menu->menu_category_id,
            'description' => $request->description ?? $menu->description,
            'price' => $request->price ?? $menu->price,
            'stock' => $request->stock ?? $menu->stock,
            'availability' => ($request->stock ?? $menu->stock) > 0 ? 'in_stock' : 'out_of_stock',
        ]);

        return response()->json([
            'message' => 'Menu item updated successfully',
            'menu' => $menu
        ]);
    }


    /**
     * ✅ Delete a menu item
     */
    public function deleteMenu(Request $request, $id)
    {
        $vendor = $request->user();
        $menu = Menu::whereHas('restaurant', function ($query) use ($vendor) {
            $query->where('owner_id', $vendor->id);
        })->where('id', $id)->firstOrFail();

        // Delete menu image
        if ($menu->image && Storage::exists('public/menus/' . $menu->image)) {
            Storage::delete('public/menus/' . $menu->image);
        }

        $menu->delete();

        return response()->json(['message' => 'Menu item deleted successfully']);
    }
}
