<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Menu;
use App\Models\Promo;
use App\Models\PromoUsage;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\Restaurant;
use App\Services\DeliveryService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon; // ✅ Import Carbon

class OrderController extends Controller
{
    /**
     * ✅ Fetch all orders for the authenticated user, including restaurant, payment, customer address, and refunds
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
            return ResponseHelper::error("User location is required for reordering", 400);
        }

        // ✅ Set max delivery distance (Example: 10km)
        $maxDistance = 10;

        $orders = Order::where('customer_id', $userId)
            ->with([
                'restaurant:id,name,address,latitude,longitude',
                'orderItems.menu:id,name,price,image',
                'payment:id,order_id,payment_method,payment_status',
                'customerAddress:id,address,latitude,longitude',
                'delivery:id,order_id,status,proof_image,delivery_time',
                'usedPromo:id,code,type,discount_percentage,discount_amount', // ✅ Include promo details
                'refund' => function ($query) {
                    $query->select('id', 'order_id', 'status', 'admin_status', 'amount', 'reason', 'image_proof', 'created_at', 'updated_at')
                        ->orderBy('created_at', 'desc');
                }
            ])
            ->latest()
            ->get()
            ->map(function ($order) use ($userLat, $userLng, $maxDistance) {
                $restaurant = $order->restaurant;
                $distance = null;
                $inRange = false;

                if ($restaurant && $restaurant->latitude && $restaurant->longitude) {
                    $distance = DeliveryService::calculateDistance($userLat, $userLng, $restaurant->latitude, $restaurant->longitude);
                    $inRange = $distance <= $maxDistance;
                }

                return [
                    'id' => $order->id,
                    'restaurant' => $restaurant ? [
                        'id' => $restaurant->id,
                        'name' => $restaurant->name,
                        'address' => $restaurant->address,
                        'latitude' => (float) $restaurant->latitude,
                        'longitude' => (float) $restaurant->longitude,
                        'distance_km' => $distance ? round($distance, 2) : null,
                        'in_range' => $inRange,
                    ] : [
                        'id' => null,
                        'name' => 'Unknown Restaurant',
                        'address' => 'No address available',
                        'latitude' => null,
                        'longitude' => null,
                        'distance_km' => null,
                        'in_range' => false,
                    ],
                    'customer_address' => $order->customerAddress ? [
                        'id' => $order->customerAddress->id,
                        'address' => $order->customerAddress->address,
                        'latitude' => (float) $order->customerAddress->latitude,
                        'longitude' => (float) $order->customerAddress->longitude,
                    ] : [
                        'id' => null,
                        'address' => 'No address available',
                        'latitude' => null,
                        'longitude' => null,
                    ],
                    'order_type' => $order->order_type,
                    'order_status' => $order->order_status,
                    'delivery_status' => optional($order->delivery)->status ?? 'not_assigned',
                    'scheduled_time' => $order->scheduled_time ? Carbon::parse($order->scheduled_time)->format('Y-m-d H:i:s') : null,
                    'delivery_proof' => $order->delivery && $order->delivery->proof_image
                        ? asset('storage/' . $order->delivery->proof_image)
                        : null,
                    'delivered_at' => $order->delivery && $order->delivery->delivery_time
                        ? Carbon::parse($order->delivery->delivery_time)->format('Y-m-d H:i:s')
                        : null,
                    'total_price' => (float) $order->total_price,
                    'subtotal' => (float) $order->subtotal,
                    'delivery_fee' => (float) $order->delivery_fee,
                    'rider_tip' => (float) $order->rider_tip,
                    'discount_on_subtotal' => (float) $order->discount_on_subtotal,
                    'discount_on_shipping' => (float) $order->discount_on_shipping,
                    'voucher' => $order->usedPromo
                        ? [
                            'code' => $order->usedPromo->code,
                            'type' => $order->usedPromo->type,
                            'discount_percentage' => $order->usedPromo->discount_percentage,
                            'discount_amount' => $order->usedPromo->discount_amount,
                        ]
                        : [
                            'code' => null,
                            'type' => null,
                            'message' => 'Voucher not recorded (placed before tracking)',
                        ],
                    'payment' => $order->payment ? [
                        'payment_method' => $order->payment->payment_method,
                        'payment_status' => $order->payment->payment_status,
                    ] : [
                        'payment_method' => 'Not available',
                        'payment_status' => 'pending',
                    ],
                    'order_items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'menu_id' => $item->menu->id ?? null,
                            'name' => $item->menu->name ?? 'Unknown Item',
                            'price' => (float) $item->price,
                            'quantity' => $item->quantity,
                            'subtotal' => (float) $item->subtotal,
                            'image' => $item->menu->image ?? null,
                        ];
                    }),
                    'refund' => $order->refund ? [
                        'id' => $order->refund->id,
                        'status' => $order->refund->status,
                        'admin_status' => $order->refund->admin_status,
                        'amount' => (float) $order->refund->amount,
                        'reason' => $order->refund->reason,
                        'image_proof' => $order->refund->image_proof,
                        'created_at' => $order->refund->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $order->refund->updated_at->format('Y-m-d H:i:s'),
                    ] : null,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return ResponseHelper::success("Orders retrieved successfully", ['orders' => $orders]);
    }




    /**
     * ✅ Fetch a single order
     */
    public function show(Order $order)
    {
        if ($order->customer_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        return response()->json(['success' => true, 'order' => $order->load('orderItems.menu')]);
    }

    /**
     * ✅ Cancel an order (Only if still pending)
     */
    public function cancelOrder(Order $order)
    {
        $user = Auth::user();

        if ($order->customer_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($order->order_status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Order cannot be canceled at this stage'], 400);
        }

        try {
            DB::beginTransaction();

            $order->update(['order_status' => 'canceled']);

            // ✅ Restore stock for each menu item
            foreach ($order->orderItems as $item) {
                $menu = $item->menu;
                $menu->restoreStock($item->quantity);
            }

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Order canceled successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Failed to cancel order.'], 500);
        }
    }

    /**
     * ✅ Store a new order (Handles Checkout)
     */
    public function store(Request $request)
    {
        Log::info("Checkout Request Payload", $request->all());

        $validated = $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'cart_items' => 'required|array|min:1',
            'cart_items.*.menu_id' => 'required|exists:menus,id',
            'cart_items.*.quantity' => 'required|integer|min:1',
            'cart_items.*.price' => 'required|numeric|min:0',
            'customer_address_id' => $request->order_type === 'delivery' ? 'required|exists:customer_addresses,id' : 'nullable',
            'order_type' => 'required|in:delivery,pickup',
            'payment_method' => 'required|in:cash,gcash,card,maya',
            'rider_tip' => 'required|numeric|min:0',
            'voucher_codes' => 'nullable|array',
            'delivery_fee' => 'required|numeric|min:0',
            'discount_on_shipping' => 'nullable|numeric|min:0',
            'discount_on_subtotal' => 'nullable|numeric|min:0',
            'total_price' => 'required|numeric|min:0',
            'scheduled_time' => 'nullable|date|after:now',
        ]);

        $user = Auth::user();

        try {
            DB::beginTransaction();

            $restaurant = Restaurant::findOrFail($validated['restaurant_id']);

            if ($restaurant->status === 'closed') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => "This restaurant is currently closed. You cannot place an order.",
                ], 403);
            }

            if ($validated['order_type'] === 'delivery' && $restaurant->service_type === 'pickup') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => "This restaurant does not support delivery.",
                ], 400);
            }

            if ($validated['order_type'] === 'pickup' && $restaurant->service_type === 'delivery') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => "This restaurant does not support pickup.",
                ], 400);
            }

            $subtotal = collect($validated['cart_items'])->sum(fn($item) => $item['price'] * $item['quantity']);

            $validated['discount_on_subtotal'] = $validated['discount_on_subtotal'] ?? 0;
            $validated['discount_on_shipping'] = $validated['discount_on_shipping'] ?? 0;

            // ✅ Handle promo logic
            $appliedPromoId = null;

            foreach ($validated['voucher_codes'] ?? [] as $code) {
                $promo = Promo::where('code', $code)->first();

                if ($promo) {
                    if (PromoUsage::where('user_id', $user->id)->where('promo_id', $promo->id)->exists()) {
                        DB::rollBack();
                        return response()->json([
                            'success' => false,
                            'message' => "You have already used the promo code '{$promo->code}'.",
                        ], 400);
                    }

                    PromoUsage::create([
                        'user_id' => $user->id,
                        'promo_id' => $promo->id,
                        'used_at' => now(),
                    ]);

                    $appliedPromoId = $promo->id;
                    break; // ✅ Apply only one promo per order
                }
            }

            $customerAddressId = $validated['order_type'] === 'pickup' ? null : $validated['customer_address_id'];

            $order = Order::create([
                'customer_id' => $user->id,
                'restaurant_id' => $validated['restaurant_id'],
                'customer_address_id' => $customerAddressId,
                'order_type' => $validated['order_type'],
                'total_price' => $validated['total_price'],
                'delivery_fee' => $validated['delivery_fee'],
                'subtotal' => $subtotal,
                'discount_on_subtotal' => $validated['discount_on_subtotal'],
                'discount_on_shipping' => $validated['discount_on_shipping'],
                'rider_tip' => $validated['rider_tip'],
                'order_status' => 'pending',
                'payment_status' => 'pending',
                'scheduled_time' => $validated['scheduled_time'] ?? null,
                'used_promo_id' => $appliedPromoId, // ✅ Set used promo here
            ]);

            foreach ($validated['cart_items'] as $item) {
                $menu = Menu::lockForUpdate()->findOrFail($item['menu_id']);

                if ($menu->availability === 'out_of_stock' || $menu->stock < $item['quantity']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Item '{$menu->name}' is out of stock.",
                    ], 400);
                }

                $menu->decrement('stock', $item['quantity']);
                if ($menu->stock <= 0) {
                    $menu->update(['availability' => 'out_of_stock']);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $item['menu_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }

            Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'amount' => $validated['total_price'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cash' ? 'success' : 'failed',
            ]);

            Cart::where('user_id', $user->id)->delete();

            // Optional: Notification system (already in comments)

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


    public function getOrders(Request $request)
    {
        $vendor = Auth::user(); // 🔥 Authenticated vendor
        $restaurant = Restaurant::where('owner_id', $vendor->id)->firstOrFail();

        $orders = Order::where('restaurant_id', $restaurant->id)
            ->with([
                'customer:id,name,email,phone_number',
                'orderItems.menu:id,name,price,image',
                'payment:id,order_id,payment_method,payment_status',
                'customerAddress:id,address,latitude,longitude',
                'delivery:id,order_id,status,proof_image,delivery_time',
                'refund' => function ($query) {
                    $query->select('id', 'order_id', 'status', 'admin_status', 'amount', 'reason', 'image_proof', 'created_at', 'updated_at')
                        ->orderBy('created_at', 'desc');
                }
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer' => $order->customer ? [
                        'id' => $order->customer->id,
                        'name' => $order->customer->name,
                        'email' => $order->customer->email,
                        'phone_number' => $order->customer->phone_number,
                    ] : null,
                    'restaurant' => [
                        'id' => $order->restaurant_id,
                        'name' => optional($order->restaurant)->name ?? 'N/A',
                    ],
                    'customer_address' => $order->customerAddress ? [
                        'id' => $order->customerAddress->id,
                        'address' => $order->customerAddress->address,
                        'latitude' => (float) $order->customerAddress->latitude,
                        'longitude' => (float) $order->customerAddress->longitude,
                    ] : null,
                    'order_type' => $order->order_type,
                    'order_status' => $order->order_status,
                    'delivery_status' => optional($order->delivery)->status ?? 'not_assigned',
                    'scheduled_time' => $order->scheduled_time ? Carbon::parse($order->scheduled_time)->format('Y-m-d H:i:s') : null,
                    'delivery_proof' => $order->delivery && $order->delivery->proof_image
                        ? asset('storage/' . $order->delivery->proof_image)
                        : null,
                    'delivered_at' => $order->delivery && $order->delivery->delivery_time
                        ? Carbon::parse($order->delivery->delivery_time)->format('Y-m-d H:i:s')
                        : null,
                    'total_price' => (float) $order->total_price,
                    'subtotal' => (float) $order->subtotal,
                    'delivery_fee' => (float) $order->delivery_fee,
                    'rider_tip' => (float) $order->rider_tip,
                    'payment' => $order->payment ? [
                        'payment_method' => $order->payment->payment_method,
                        'payment_status' => $order->payment->payment_status,
                    ] : [
                        'payment_method' => 'Not available',
                        'payment_status' => 'pending',
                    ],
                    'order_items' => $order->orderItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'menu_id' => $item->menu->id ?? null,
                            'name' => $item->menu->name ?? 'Unknown Item',
                            'price' => (float) $item->price,
                            'quantity' => $item->quantity,
                            'subtotal' => (float) $item->subtotal,
                            'image' => $item->menu->image ?? null,
                        ];
                    }),
                    'refund' => $order->refund ? [
                        'id' => $order->refund->id,
                        'status' => $order->refund->status,
                        'admin_status' => $order->refund->admin_status,
                        'amount' => (float) $order->refund->amount,
                        'reason' => $order->refund->reason,
                        'image_proof' => $order->refund->image_proof,
                        'created_at' => $order->refund->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $order->refund->updated_at->format('Y-m-d H:i:s'),
                    ] : null,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json(['orders' => $orders]);
    }


    /**
     * ✅ Get a specific order's details
     */
    public function getOrderDetails(Request $request, $id)
    {
        $vendor = Auth::user(); // 🔥 Get authenticated user using Bearer token
        $restaurant = Restaurant::where('owner_id', $vendor->id)->firstOrFail();

        $order = Order::where('restaurant_id', $restaurant->id)
            ->with(['customer', 'orderItems.menu', 'payment'])
            ->findOrFail($id);

        return response()->json(['order' => $order]);
    }

    /**
     * ✅ Update order status (e.g., Confirm, Cancel, Deliver)
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $vendor = Auth::user(); // 🔥 Get authenticated user using Bearer token
        $restaurant = Restaurant::where('owner_id', $vendor->id)->firstOrFail();

        $order = Order::where('restaurant_id', $restaurant->id)
            ->findOrFail($id);

        $request->validate([
            'order_status' => 'required|in:pending,confirmed,preparing,completed,canceled'
        ]);

        $order->update([
            'order_status' => $request->order_status
        ]);

        return response()->json(['message' => 'Order status updated successfully.', 'order' => $order]);
    }
}
