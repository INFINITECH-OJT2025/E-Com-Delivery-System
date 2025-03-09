<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Menu;
use App\Models\Promo;
use App\Models\PromoUsage;
use App\Models\Payment;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * ✅ Store a new order (Handles Checkout)
     */
    public function store(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'cart_items' => 'required|array|min:1',
            'cart_items.*.menu_id' => 'required|exists:menus,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'cart_items.*.price' => 'required|numeric|min:0',
            'delivery_address_id' => 'required|exists:customer_addresses,id',
            'order_type' => 'required|in:delivery,pickup',
            'payment_method' => 'required|in:cash,gcash,card,maya',
            'rider_tip' => 'required|numeric|min:0',
            'voucher_codes' => 'nullable|array',
        ]);

        $user = Auth::user(); // ✅ Get authenticated user

        try {
            DB::beginTransaction();

            // ✅ Fetch Restaurant
            $restaurant = Restaurant::findOrFail($request->restaurant_id);

            // ❌ Prevent order if the restaurant is closed
            if ($restaurant->status === 'closed') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => "This restaurant is currently closed. You cannot place an order.",
                ], 403);
            }

            // ✅ Calculate Subtotal
            $subtotal = collect($request->cart_items)->sum(fn($item) => $item['price'] * $item['quantity']);
            $delivery_fee = 50; // ✅ Default fee (Later, fetch actual from DB)
            $discount = 0;

            // ✅ Apply Vouchers
            if (!empty($request->voucher_codes)) {
                foreach ($request->voucher_codes as $code) {
                    $promo = Promo::where('code', $code)->first();

                    if ($promo) {
                        $discount += $promo->discount_percentage
                            ? ($subtotal * ($promo->discount_percentage / 100))
                            : $promo->discount_amount;

                        // ✅ Prevent duplicate usage
                        if (PromoUsage::where('user_id', $user->id)->where('promo_id', $promo->id)->exists()) {
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => "You have already used the promo code '{$promo->code}'.",
                            ], 400);
                        }

                        // ✅ Track Promo Usage
                        PromoUsage::create([
                            'user_id' => $user->id,
                            'promo_id' => $promo->id,
                            'used_at' => now(),
                        ]);
                    }
                }
            }

            // 🛠 **Final Order Total Calculation**
            $total_price = max($subtotal - $discount + $delivery_fee + $request->rider_tip, 0);

            // ✅ **Create Order**
            $order = Order::create([
                'customer_id' => $user->id,
                'restaurant_id' => $request->restaurant_id,
                'delivery_address_id' => $request->delivery_address_id,
                'order_type' => $request->order_type,
                'total_price' => $total_price,
                'rider_tip' => $request->rider_tip,
                'order_status' => 'pending',
                'payment_status' => 'pending',
            ]);

            // ✅ **Insert Order Items & Deduct Stock**
            foreach ($request->cart_items as $item) {
                $menu = Menu::lockForUpdate()->findOrFail($item['menu_id']); // 🔒 Prevent race conditions

                // ❌ Prevent ordering if out of stock
                if ($menu->availability === 'out_of_stock' || $menu->stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Item '{$menu->name}' is out of stock.",
                    ], 400);
                }

                // ✅ Deduct stock safely
                $menu->decrement('stock', $item['quantity']);
                if ($menu->stock <= 0) {
                    $menu->update(['availability' => 'out_of_stock']); // 🚨 Mark as out of stock
                }

                // ✅ Save Order Item
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }

            // ✅ **Create Payment Entry**
            Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'amount' => $total_price,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'cash' ? 'success' : 'failed',
            ]);

            // ✅ **Clear User's Cart After Order**
            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully!',
                'order_id' => $order->id
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error processing order: ' . $e->getMessage(),
            ], 500);
        }
    }
}
