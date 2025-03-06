<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\CustomerAddress;
use App\Helpers\ResponseHelper;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * ✅ Handle Checkout Process (Cash on Delivery for now)
     */
    public function checkout(Request $request)
    {
        $user = Auth::user();

        // ✅ Validate user has a cart
        $cart = Cart::where('user_id', $user->id)->with('cartItems.menu')->first();
        if (!$cart || $cart->cartItems->isEmpty()) {
            return ResponseHelper::error("Your cart is empty.", 400);
        }

        // ✅ Validate address
        $address = CustomerAddress::where('user_id', $user->id)
            ->where('is_default', true)
            ->first();

        if (!$address) {
            return ResponseHelper::error("No default address found. Please select an address.", 400);
        }

        DB::beginTransaction();
        try {
            // ✅ Create Order
            $order = Order::create([
                'customer_id' => $user->id,
                'restaurant_id' => $cart->restaurant_id,
                'total_price' => $cart->cartItems->sum('subtotal'),
                'order_status' => 'pending',
                'payment_status' => 'pending',
                'scheduled_time' => null, // Will allow scheduling in future updates
            ]);

            // ✅ Move Cart Items to Order Items
            foreach ($cart->cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $item->menu_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                    'subtotal' => $item->subtotal,
                ]);
            }

            // ✅ Create Payment Entry (Cash on Delivery for now)
            Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'amount' => $order->total_price,
                'payment_method' => 'cash', // COD for now
                'payment_status' => 'pending',
                'transaction_id' => null, // Future integration for online payments
            ]);

            // ✅ Clear Cart
            $cart->cartItems()->delete();
            $cart->delete(); // Remove the cart entry if it's empty

            DB::commit();
            return ResponseHelper::success("Order placed successfully!", ['order_id' => $order->id]);
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error("Failed to process checkout. Please try again.", 500);
        }
    }
}
