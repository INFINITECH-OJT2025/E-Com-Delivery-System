<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Menu;
use App\Helpers\ResponseHelper;
use App\Models\Restaurant;

class CartController extends Controller
{
    /**
     * ✅ Display the authenticated user's cart.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return ResponseHelper::error("Unauthorized", 401);
        }

        $cart = Cart::with(['cartItems.menu', 'restaurant']) // ✅ Load restaurant details
            ->where('user_id', $user->id)
            ->first();

        if (!$cart) {
            return ResponseHelper::success("Cart is empty", ['cart_items' => []]);
        }

        return ResponseHelper::success("Cart retrieved", [
            'id' => $cart->id,
            'user_id' => $cart->user_id,
            'restaurant_id' => $cart->restaurant_id,
            'restaurant_name' => $cart->restaurant->name ?? "Unknown", // ✅ Include restaurant name
            'restaurant_status' => $cart->restaurant->status,
            'cart_items' => $cart->cartItems
        ]);
    }

    /**
     * ✅ Add an item to the cart.
     */
    public function store(Request $request)
    {
        $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1',
            'restaurant_id' => 'required|exists:restaurants,id',
        ]);

        $userId = Auth::id();

        DB::beginTransaction();
        try {
            // ✅ Check if the user already has items from another restaurant
            $existingCart = Cart::where('user_id', $userId)
                ->where('restaurant_id', '!=', $request->restaurant_id)
                ->first();

            if ($existingCart) {
                // ❌ Prevent adding new items from a different restaurant
                DB::rollBack();
                return ResponseHelper::error("Your cart contains items from another restaurant. Please clear your cart before adding new items.", 400);
            }

            // ✅ Fetch restaurant details
            $restaurant = Restaurant::findOrFail($request->restaurant_id);

            // ❌ Prevent adding items if restaurant is closed
            if ($restaurant->status === 'closed') {
                DB::rollBack();
                return ResponseHelper::error("This restaurant is currently closed. You cannot add items to the cart.", 403);
            }

            // ✅ Find or create a new cart for this restaurant
            $cart = Cart::firstOrCreate([
                'user_id' => $userId,
                'restaurant_id' => $restaurant->id
            ]);

            // ✅ Lock the menu row to prevent race conditions
            $menuItem = Menu::lockForUpdate()->findOrFail($request->menu_id);

            // ❌ Prevent adding out-of-stock items
            if ($menuItem->availability === 'out_of_stock' || $menuItem->stock < $request->quantity) {
                DB::rollBack();
                return ResponseHelper::error("This item is out of stock or does not have enough stock available.", 403);
            }

            // ✅ Check if the item already exists in the cart
            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('menu_id', $menuItem->id)
                ->first();

            if ($cartItem) {
                // ✅ If the item exists, update the quantity and subtotal
                $newQuantity = $cartItem->quantity + $request->quantity;

                // ❌ Prevent exceeding available stock
                if ($newQuantity > $menuItem->stock) {
                    DB::rollBack();
                    return ResponseHelper::error("Not enough stock available for this item.", 403);
                }

                $cartItem->increment('quantity', $request->quantity);
                $cartItem->update([
                    'subtotal' => $cartItem->quantity * $cartItem->price
                ]);
            } else {
                // ✅ If it's a new item, create a new cart item
                $cartItem = CartItem::create([
                    'cart_id' => $cart->id,
                    'menu_id' => $menuItem->id,
                    'quantity' => $request->quantity,
                    'price' => $menuItem->price,
                    'subtotal' => $menuItem->price * $request->quantity
                ]);
            }

            DB::commit();
            return ResponseHelper::success("Item added to cart", [
                'cart_id' => $cart->id,
                'restaurant_id' => $cart->restaurant_id,
                'restaurant_name' => $cart->restaurant->name ?? "Unknown", // ✅ Include restaurant name
                'cart_items' => CartItem::where('cart_id', $cart->id)->with('menu')->get()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error("Failed to add item to cart. Please try again.", 500);
        }
    }


    /**
     * ✅ Show a single cart item.
     */
    public function show(string $id)
    {
        $cartItem = CartItem::where('id', $id)
            ->whereHas('cart', fn($query) => $query->where('user_id', Auth::id()))
            ->with('menu')
            ->firstOrFail();

        return ResponseHelper::success("Cart item retrieved", $cartItem);
    }

    /**
     * ✅ Update an existing cart item quantity.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            $cartItem = CartItem::where('id', $id)
                ->whereHas('cart', fn($query) => $query->where('user_id', Auth::id()))
                ->firstOrFail();

            $menu = Menu::lockForUpdate()->findOrFail($cartItem->menu_id);
            $restaurant = $menu->restaurant;

            // ❌ Prevent updating quantity if restaurant is closed
            if ($restaurant->status === 'closed') {
                DB::rollBack();
                return ResponseHelper::error("This restaurant is currently closed. You cannot update the cart.", 403);
            }

            // ❌ Prevent updating if stock is insufficient
            if ($menu->availability === 'out_of_stock' || $menu->stock < $request->quantity) {
                DB::rollBack();
                return ResponseHelper::error("Insufficient stock for this item.", 403);
            }

            // ✅ Update cart item quantity and subtotal
            $cartItem->update([
                'quantity' => $request->quantity,
                'subtotal' => $cartItem->price * $request->quantity
            ]);

            DB::commit();
            return ResponseHelper::success("Cart updated", $cartItem);
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error("Failed to update cart item. Please try again.", 500);
        }
    }


    /**
     * ✅ Remove an item from the cart.
     */
    public function destroy(string $id)
    {
        DB::beginTransaction();
        try {
            $cartItem = CartItem::where('id', $id)
                ->whereHas('cart', fn($query) => $query->where('user_id', Auth::id()))
                ->firstOrFail();

            $cartItem->delete();

            // ✅ If the cart is now empty, delete the cart as well
            $cart = Cart::where('id', $cartItem->cart_id)->first();
            if ($cart && $cart->cartItems()->count() === 0) {
                $cart->delete();
            }

            DB::commit();
            return ResponseHelper::success("Item removed from cart");
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error("Failed to remove item from cart. Please try again.", 500);
        }
    }

    /**
     * ✅ Clear the entire cart (Useful when switching restaurants).
     */
    public function clearCart()
    {
        DB::beginTransaction();
        try {
            $userId = Auth::id();

            // ✅ Find the user's cart
            $cart = Cart::where('user_id', $userId)->first();

            if (!$cart) {
                return ResponseHelper::success("Cart already empty", []);
            }

            // ✅ Remove all cart items and delete the cart
            $cart->cartItems()->delete();
            $cart->delete();

            DB::commit();
            return ResponseHelper::success("Cart cleared successfully");
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error("Failed to clear cart. Please try again.", 500);
        }
    }
}
