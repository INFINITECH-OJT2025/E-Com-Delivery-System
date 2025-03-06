<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\CustomerAddress;
use App\Helpers\ResponseHelper;

class CheckoutController extends Controller
{
    /**
     * ✅ Process Checkout (Only COD for now)
     */
    public function checkout(Request $request)
    {
        $user = Auth::user();

        // ✅ Validate that user has necessary details
        if (!$user->phone_number) {
            return ResponseHelper::error("Please update your profile with a valid phone number before checkout.", 400);
        }

        // ✅ Validate Request
        $request->validate([
            'address_id' => 'required|exists:customer_addresses,id',
            'payment_method' => 'required|in:cod'
        ]);

        // ✅ Get Selected Address
        $address = CustomerAddress::where('id', $request->address_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$address) {
            return ResponseHelper::error("Invalid delivery address.", 400);
        }

        // ✅ Check if Cart Exists
        $cart = Cart::where('user_id', $user->id)->with('cartItems.menu')->first();
        if (!$cart || $cart->cartItems->isEmpty()) {
            return ResponseHelper::error("Your cart is empty.", 400);
        }

        DB::beginTransaction();
        try {
            // ✅ Create Order
            $order = Order::create([
                'customer_id' => $user->id,
                'restaurant_id' => $cart->restaurant_id,
                'total_price' => $cart->cartItems->sum('subtotal'),
                'order_status' => 'pending',
                'payment_status' => 'pending'
            ]);

            // ✅ Move Cart Items to Order Items
            foreach ($cart->cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $cartItem->menu_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'subtotal' => $cartItem->subtotal
                ]);
            }

            // ✅ Store Payment Information (COD for now)
            Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'amount' => $order->total_price,
                'payment_method' => 'cod',
                'payment_status' => 'pending'
            ]);

            // ✅ Clear the Cart
            $cart->cartItems()->delete();
            $cart->delete();

            DB::commit();
            return ResponseHelper::success("Order placed successfully!", ['order_id' => $order->id]);
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error("Failed to process order. Please try again.", 500);
        }
    }
}
