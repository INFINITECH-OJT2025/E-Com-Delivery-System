<?php

namespace App\Http\Controllers;

use App\Events\RiderLocationUpdated;
use App\Helpers\ResponseHelper;
use App\Models\Delivery;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Remittance;
use App\Models\User;
use App\Services\DeliveryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Spatie\Activitylog\Models\Activity;

class RiderController extends Controller
{
    public function all()
    {
        $riders = User::where('role', 'rider')
            ->select('id', 'name', 'email', 'phone_number', 'created_at', 'status')
            ->latest()
            ->get();

        return response()->json(['riders' => $riders]);
    }
    /**
     * ✅ Get Rider Profile
     */
    public function getProfile()
    {
        $rider = Auth::user();

        if (!$rider || $rider->role !== 'rider') {
            return ResponseHelper::error("Unauthorized access", 403);
        }

        return ResponseHelper::success("Profile fetched successfully", [
            'id' => $rider->id,
            'name' => $rider->name,
            'email' => $rider->email,
            'phone_number' => $rider->phone_number,
            'vehicle_type' => $rider->vehicle_type,
            'plate_number' => $rider->plate_number,
            'rider_status' => $rider->rider_status,
            'profile_image' => asset('storage/' . $rider->profile_image),
            'license_image' => asset('storage/' . $rider->license_image),
        ]);
    }
    /**
     * ✅ Get Assigned Orders for Rider
     */
    public function getAssignedOrders(Request $request)
    {
        $riderId = Auth::id();

        // ✅ Fetch orders assigned to this rider
        $orders = Order::selectRaw("
            orders.id AS order_id, orders.customer_id, orders.restaurant_id, orders.customer_address_id,
            orders.total_price, orders.subtotal, orders.discount_on_subtotal, orders.discount_on_shipping, 
            orders.delivery_fee, orders.rider_tip, orders.order_status, orders.payment_status, orders.scheduled_time,
            restaurants.name AS restaurant_name, restaurants.latitude AS restaurant_lat, restaurants.longitude AS restaurant_lng,
            customer_addresses.address AS customer_address, customer_addresses.latitude AS customer_lat, customer_addresses.longitude AS customer_lng
        ")
            ->join('restaurants', 'orders.restaurant_id', '=', 'restaurants.id')
            ->join('customer_addresses', 'orders.customer_address_id', '=', 'customer_addresses.id')
            ->where('orders.delivery_rider_id', $riderId)
            ->whereNotIn('orders.order_status', ['completed', 'canceled']) // ✅ Exclude completed/canceled orders
            ->orderBy('orders.updated_at', 'desc') // ✅ Most recent orders first
            ->get();

        // ✅ Append Distance & Estimated Delivery Time
        foreach ($orders as $order) {
            $order->restaurant_to_customer_distance = DeliveryService::calculateDistance(
                $order->restaurant_lat,
                $order->restaurant_lng,
                $order->customer_lat,
                $order->customer_lng
            );

            $order->estimated_delivery_time = DeliveryService::estimateDeliveryTime($order->restaurant_to_customer_distance);

            // ✅ Fetch Order Items
            $order->items = DB::table('order_items')
                ->join('menus', 'order_items.menu_id', '=', 'menus.id')
                ->select(
                    'order_items.menu_id',
                    'menus.name AS item_name',
                    'order_items.quantity',
                    'order_items.price',
                    'order_items.subtotal'
                )
                ->where('order_items.order_id', $order->order_id)
                ->get();
        }

        return ResponseHelper::success("Assigned orders retrieved.", $orders);
    }

    public function acceptOrder(Request $request)
    {
        $rider = Auth::user();

        if (!$rider || $rider->role !== 'rider') {
            return ResponseHelper::error("Unauthorized access", 403);
        }

        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::findOrFail($request->order_id);

        if ($order->delivery_rider_id !== null) {
            return ResponseHelper::error("This order is already assigned to another rider.", 403);
        }

        if ($order->order_status !== "confirmed") {
            return ResponseHelper::error("Only confirmed orders can be accepted.", 400);
        }

        // ✅ Assign rider to order
        $order->update([
            'delivery_rider_id' => $rider->id,
        ]);

        // ✅ Create a delivery record to track rider progress
        $delivery = Delivery::create([
            'order_id' => $order->id,
            'rider_id' => $rider->id,
            'status' => 'assigned', // ✅ Start with "assigned"
            'current_lat' => null, // ✅ These get updated later
            'current_lng' => null,
        ]);

        return ResponseHelper::success("Order assigned successfully", [
            'order_id' => $order->id,
            'rider_id' => $rider->id,
            'order_status' => $order->order_status, // ✅ Order tracking
            'delivery_status' => $delivery->status, // ✅ Rider tracking
        ]);
    }

    /**
     * ✅ Update Rider Delivery Status
     */
    public function updateOrderStatus(Request $request)
    {
        $rider = Auth::user();

        if (!$rider || $rider->role !== 'rider') {
            return ResponseHelper::error("Unauthorized access", 403);
        }

        $validDeliveryStatuses = [
            'assigned',
            'arrived_at_vendor',
            'picked_up',
            'in_delivery',
            'arrived_at_customer',
            'photo_uploaded',
            'delivered'
        ];

        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'status' => 'required|in:' . implode(',', $validDeliveryStatuses),
            'current_lat' => 'nullable|numeric',
            'current_lng' => 'nullable|numeric',
        ]);

        $order = Order::findOrFail($request->order_id);

        if ($order->delivery_rider_id !== $rider->id) {
            return ResponseHelper::error("You are not assigned to this order.", 403);
        }

        $delivery = Delivery::firstOrCreate(
            ['order_id' => $order->id, 'rider_id' => $rider->id],
            ['status' => 'assigned']
        );

        $deliveryUpdateData = [
            'status' => $request->status,
            'current_lat' => $request->input('current_lat', $delivery->current_lat),
            'current_lng' => $request->input('current_lng', $delivery->current_lng),
        ];

        // ✅ Add timestamps based on status
        if ($request->status === 'picked_up') {
            $deliveryUpdateData['pickup_time'] = now();
        }

        if ($request->status === 'delivered') {
            $deliveryUpdateData['delivery_time'] = now();
        }

        $delivery->update($deliveryUpdateData);

        // ✅ Synchronize Order Status based on Delivery Status
        $orderStatus = match ($request->status) {
            'assigned', 'arrived_at_vendor' => 'preparing',
            'picked_up', 'in_delivery', 'arrived_at_customer' => 'out_for_delivery',
            'photo_uploaded', 'delivered' => 'completed',
            default => $order->order_status,
        };

        // ✅ If order is completed, set `payment_status` to `paid`
        $paymentStatus = ($orderStatus === 'completed') ? 'paid' : $order->payment_status;

        $order->update([
            'order_status' => $orderStatus,
            'payment_status' => $paymentStatus, // ✅ Set payment to paid when completed
        ]);

        return ResponseHelper::success("Order status updated successfully", [
            'order_id' => $order->id,
            'order_status' => $order->order_status,
            'payment_status' => $order->payment_status, // ✅ Return updated payment status
            'delivery_status' => $delivery->status,
            'pickup_time' => $delivery->pickup_time,
            'delivery_time' => $delivery->delivery_time,
        ]);
    }

    /**
     * ✅ Fetch Rider Earnings & Payouts
     */
    public function getEarnings()
    {
        $rider = Auth::user();

        if (!$rider || $rider->role !== 'rider') {
            return ResponseHelper::error("Unauthorized access", 403);
        }

        // Get all completed orders delivered by the rider
        $orders = Order::where('delivery_rider_id', $rider->id)
            ->where('order_status', 'completed')
            ->get(['delivery_fee', 'rider_tip']);

        // Calculate total earnings (90% delivery fee + full tip)
        $totalEarnings = $orders->reduce(function ($carry, $order) {
            return $carry + (floatval($order->delivery_fee) * 0.9) + floatval($order->rider_tip);
        }, 0);

        return ResponseHelper::success("Earnings fetched successfully", [
            'total_earnings' => round($totalEarnings, 2)
        ]);
    }

    /**
     * ✅ Fetch Rider Notifications
     */
    public function getNotifications()
    {
        $rider = Auth::user();

        if (!$rider || $rider->role !== 'rider') {
            return ResponseHelper::error("Unauthorized access", 403);
        }

        $notifications = Notification::where('user_id', $rider->id)->latest()->get();

        return ResponseHelper::success("Notifications fetched successfully", $notifications);
    }

    /**
     * ✅ Fetch Nearby Orders for Riders
     */
    public function getNearbyOrders(Request $request)
    {
        $latitude = $request->query('lat');
        $longitude = $request->query('lng');
        $radius = 10;
        if (!$latitude || !$longitude) {
            return ResponseHelper::error("Latitude and Longitude are required.", 400);
        }

        $orders = Order::selectRaw("
                orders.id AS order_id, orders.customer_id, orders.restaurant_id, orders.customer_address_id,
                orders.total_price, orders.subtotal, orders.discount_on_subtotal, orders.discount_on_shipping, 
                orders.delivery_fee, orders.rider_tip, orders.order_status, orders.payment_status, orders.scheduled_time,
                restaurants.name AS restaurant_name, restaurants.latitude AS restaurant_lat, restaurants.longitude AS restaurant_lng,
                customer_addresses.address AS customer_address, customer_addresses.latitude AS customer_lat, customer_addresses.longitude AS customer_lng,
                (6371 * acos(cos(radians(?)) * cos(radians(customer_addresses.latitude)) 
                * cos(radians(customer_addresses.longitude) - radians(?)) + sin(radians(?)) 
                * sin(radians(customer_addresses.latitude)))) AS distance
            ", [$latitude, $longitude, $latitude])
            ->join('restaurants', 'orders.restaurant_id', '=', 'restaurants.id')
            ->join('customer_addresses', 'orders.customer_address_id', '=', 'customer_addresses.id')
            ->whereNull('orders.delivery_rider_id') // ✅ Only unassigned orders
            ->whereIn('orders.order_status', ['confirmed', 'out_for_delivery']) // ✅ Fetch only confirmed or out-for-delivery orders
            ->havingRaw("distance <= ?", [$radius]) // ✅ Filter within the search radius
            ->orderBy('distance', 'asc')
            ->get();

        // ✅ Attach Order Breakdown & Additional Info
        return self::formatOrders($orders);
    }

    /**
     * ✅ Attach Order Items, Distance, and Promo Details
     */
    private static function formatOrders($orders)
    {
        foreach ($orders as $order) {
            // ✅ Fetch Order Items (Using Eager Loading)
            $order->items = DB::table('order_items')
                ->join('menus', 'order_items.menu_id', '=', 'menus.id')
                ->select('order_items.menu_id', 'menus.name AS item_name', 'order_items.quantity', 'order_items.price', 'order_items.subtotal')
                ->where('order_items.order_id', $order->order_id)
                ->get();

            // ✅ Calculate Distance from Restaurant to Customer
            $order->restaurant_to_customer_distance = DeliveryService::calculateDistance(
                $order->restaurant_lat,
                $order->restaurant_lng,
                $order->customer_lat,
                $order->customer_lng
            );

            // ✅ Estimate Delivery Time
            $order->estimated_delivery_time = DeliveryService::estimateDeliveryTime($order->restaurant_to_customer_distance);

            // ✅ Fetch Applied Promo (if any)
            $order->promo = self::getPromoDetails($order->customer_id);
        }

        return ResponseHelper::success("Nearby orders retrieved", $orders);
    }

    /**
     * ✅ Fetch Promo Details (If Used by Customer)
     */
    private static function getPromoDetails($customerId)
    {
        return DB::table('promo_usages')
            ->join('promos', 'promo_usages.promo_id', '=', 'promos.id')
            ->where('promo_usages.user_id', $customerId)
            ->where('promo_usages.used_at', '>=', now()->subHours(24)) // ✅ Check for recent promos
            ->select('promos.code', 'promos.discount_percentage', 'promos.discount_amount')
            ->first();
    }
    /**
     * ✅ Get Order Details (Now includes restaurant & customer details)
     */
    public function getOrderDetails($orderId)
    {
        // ✅ Fetch order with restaurant, customer & delivery status
        $order = Order::selectRaw("
            orders.id AS order_id, orders.customer_id, orders.restaurant_id, orders.customer_address_id,
            orders.total_price, orders.subtotal, orders.discount_on_subtotal, orders.discount_on_shipping, 
            orders.delivery_fee, orders.rider_tip, orders.order_status, orders.payment_status, orders.scheduled_time,
            
            -- ✅ Restaurant Details
            restaurants.name AS restaurant_name, restaurants.address AS restaurant_address, 
            restaurants.phone_number AS restaurant_phone, restaurants.latitude AS restaurant_lat, restaurants.longitude AS restaurant_lng,
            
            -- ✅ Customer Address
            customer_addresses.address AS customer_address, customer_addresses.latitude AS customer_lat, customer_addresses.longitude AS customer_lng,
            
            -- ✅ Customer Details
            users.name AS customer_name, users.phone_number AS customer_phone,
    
            -- ✅ Delivery Status
            deliveries.status AS delivery_status
        ")
            ->join('restaurants', 'orders.restaurant_id', '=', 'restaurants.id')
            ->join('customer_addresses', 'orders.customer_address_id', '=', 'customer_addresses.id')
            ->join('users', 'orders.customer_id', '=', 'users.id') // ✅ Join with users table
            ->join('deliveries', 'orders.id', '=', 'deliveries.order_id') // ✅ Join with deliveries table
            ->where('orders.id', $orderId)
            ->first();

        // ✅ Order not found
        if (!$order) {
            return ResponseHelper::error("Order not found.", 404);
        }

        // ✅ Append Distance & Estimated Delivery Time
        $order->restaurant_to_customer_distance = DeliveryService::calculateDistance(
            $order->restaurant_lat,
            $order->restaurant_lng,
            $order->customer_lat,
            $order->customer_lng
        );

        $order->estimated_delivery_time = DeliveryService::estimateDeliveryTime($order->restaurant_to_customer_distance);

        // ✅ Fetch Order Items
        $order->items = DB::table('order_items')
            ->join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->select(
                'order_items.menu_id',
                'menus.name AS item_name',
                'order_items.quantity',
                'order_items.price',
                'order_items.subtotal'
            )
            ->where('order_items.order_id', $order->order_id)
            ->get();

        return ResponseHelper::success("Order details retrieved.", $order);
    }
    public function uploadProofOfDelivery(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'proof_image' => 'required|image|mimes:jpeg,png,jpg,webp',
        ]);

        // Fetch the delivery record via order_id
        $delivery = Delivery::where('order_id', $request->order_id)->first();

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery record not found for this order.',
            ], 404);
        }

        // Store the image
        $imagePath = $request->file('proof_image')->store('proofs', 'public');

        // Update the delivery record
        $delivery->update([
            'proof_image' => $imagePath,
            'status' => 'photo_uploaded',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Proof of delivery uploaded successfully!',
            'image_url' => Storage::url($imagePath),
        ]);
    }
    public function updateRiderLocation(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'current_lat' => 'required|numeric',
            'current_lng' => 'required|numeric',
        ]);

        $rider = Auth::user();

        // ✅ Ensure the rider is assigned to the given order
        $order = Order::findOrFail($request->order_id);
        if ($order->delivery_rider_id !== $rider->id) {
            return ResponseHelper::error("You are not assigned to this order.", 403);
        }

        // ✅ Find or create the Delivery entry associated with the rider and order
        $delivery = Delivery::firstOrCreate(
            ['order_id' => $order->id, 'rider_id' => $rider->id],
            ['status' => 'in_delivery']
        );

        // ✅ Update the delivery location
        $delivery->update([
            'current_lat' => $request->current_lat,
            'current_lng' => $request->current_lng,
        ]);

        // ✅ Broadcast the updated location (Laravel Reverb or WebSockets)
        broadcast(new RiderLocationUpdated($delivery))->toOthers();

        return ResponseHelper::success('Location updated successfully');
    }

    public function getAllRidersWithEarnings(Request $request)
    {
        // ✅ Get all riders
        $query = User::where('role', 'rider');

        // ✅ Apply Search Filter (if provided)
        if (!empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                    ->orWhere('email', 'LIKE', "%{$request->search}%")
                    ->orWhere('phone_number', 'LIKE', "%{$request->search}%");
            });
        }

        // ✅ Apply Status Filter (if provided)
        if (!empty($request->status)) {
            $query->where('status', $request->status);
        }

        // ✅ Fetch paginated riders
        $riders = $query->paginate(10);

        // ✅ Calculate earnings per rider & platform earnings
        $platformEarnings = 0;

        $riders->getCollection()->transform(function ($rider) use (&$platformEarnings) {

            // ✅ Fetch completed orders delivered by this rider
            $completedOrders = Order::where('delivery_rider_id', $rider->id)
                ->where('order_status', 'completed')
                ->get(['delivery_fee', 'rider_tip']);

            // ✅ Compute total earnings using the exact logic from `getEarnings()`
            $totalEarnings = $completedOrders->reduce(function ($carry, $order) use (&$platformEarnings) {
                $riderShare = (floatval($order->delivery_fee) * 0.9) + floatval($order->rider_tip);
                $platformShare = floatval($order->delivery_fee) * 0.1;

                $platformEarnings += $platformShare;

                return $carry + $riderShare;
            }, 0);

            return [
                'id' => $rider->id,
                'name' => $rider->name,
                'email' => $rider->email,
                'phone_number' => $rider->phone_number,
                'status' => $rider->status,
                'vehicle_type' => $rider->vehicle_type,
                'profile_image' => $rider->profile_image,
                'liscence_image' => $rider->license_image,
                'total_earnings' => round($totalEarnings, 2),
                'total_completed_orders' => $completedOrders->count()
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Riders retrieved successfully',
            'data' => [
                'riders' => $riders,
                'total_platform_earnings' => round($platformEarnings, 2),
            ]
        ], 200);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approve,ban',
        ]);

        $rider = User::where('role', 'rider')->findOrFail($id);

        $newStatus = $request->action === 'approve' ? 'approved' : 'banned';
        $rider->status = $newStatus;
        $rider->save();

        return response()->json([
            'status' => 'success',
            'message' => "Rider has been {$newStatus}.",
            'rider' => $rider,
        ]);
    }
    public function getDeliveryHistory()
    {
        $rider = Auth::user();

        if (!$rider || $rider->role !== 'rider') {
            return ResponseHelper::error("Unauthorized access", 403);
        }

        $completedOrders = Order::selectRaw("
            orders.id AS order_id,
            orders.total_price,
            orders.delivery_fee,
            orders.rider_tip,
            orders.updated_at,
            restaurants.name AS restaurant_name,
            customer_addresses.address AS customer_address
        ")
            ->join('restaurants', 'orders.restaurant_id', '=', 'restaurants.id')
            ->join('customer_addresses', 'orders.customer_address_id', '=', 'customer_addresses.id')
            ->where('orders.delivery_rider_id', $rider->id)
            ->where('orders.order_status', 'completed')
            ->orderBy('orders.updated_at', 'desc')
            ->get();

        foreach ($completedOrders as $order) {
            $order->earnings = round((floatval($order->delivery_fee) * 0.9) + floatval($order->rider_tip), 2);
            $order->items = DB::table('order_items')
                ->join('menus', 'order_items.menu_id', '=', 'menus.id')
                ->select('menus.name as item_name', 'order_items.quantity', 'order_items.subtotal')
                ->where('order_items.order_id', $order->order_id)
                ->get();
        }

        $totalEarnings = $completedOrders->sum('earnings');

        return ResponseHelper::success("Delivery history fetched successfully", [
            'orders' => $completedOrders,
            'total_earnings' => round($totalEarnings, 2),
        ]);
    }
    public function requestRemittance(Request $request)
    {
        $rider = Auth::user();

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'remit_date' => 'required|date',
            'proof_image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'notes' => 'nullable|string|max:255',
        ]);

        $path = $request->file('proof_image')->store('remittances', 'public');

        $remittance = Remittance::create([
            'rider_id' => $rider->id,
            'amount' => $request->amount,
            'expected_amount' => $request->amount, // assume no short unless admin flags it
            'remit_date' => $request->remit_date,
            'status' => 'pending',
            'proof_image' => $path,
            'notes' => $request->notes,
            'is_short' => 0,
        ]);

        return ResponseHelper::success('Remittance request submitted.', $remittance);
    }
    public function getRemittanceHistory()
    {
        $rider = Auth::user();

        $remittances = Remittance::where('rider_id', $rider->id)
            ->orderByDesc('remit_date')
            ->get();

        return ResponseHelper::success('Remittance history fetched.', $remittances);
    }
    public function getExpectedRemittanceSinceLast()
    {
        $rider = Auth::user();

        // Get last remittance date
        $lastRemittance = Remittance::where('rider_id', $rider->id)
            ->orderByDesc('remit_date')
            ->first();

        $startDate = $lastRemittance ? $lastRemittance->remit_date : now()->subMonths(3)->toDateString();

        // Fetch completed orders since last remittance
        $orders = Order::where('delivery_rider_id', $rider->id)
            ->whereDate('updated_at', '>', $startDate)
            ->where('order_status', 'completed')
            ->get(['delivery_fee', 'rider_tip', 'updated_at']);

        // 💰 Total delivery fee and tips
        $totalDeliveryFees = $orders->sum('delivery_fee');
        $totalTips = $orders->sum('rider_tip');

        // 💵 Rider earns 90% of delivery fee + 100% tips
        $riderShare = ($totalDeliveryFees * 0.9) + $totalTips;

        // 🧾 System keeps 10% of delivery fee
        $expectedRemittance = $totalDeliveryFees * 0.1;

        return ResponseHelper::success('Expected remittance since last remittance date.', [
            'since' => $startDate,
            'total_delivery_fees' => round($totalDeliveryFees, 2),
            'total_tips' => round($totalTips, 2),
            'rider_share' => round($riderShare, 2),
            'expected_remittance' => round($expectedRemittance, 2),
        ]);
    }
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        // ✅ Only allow riders to update
        if ($user->role !== 'rider') {
            return ResponseHelper::error("Unauthorized access", 403);
        }

        // ✅ Validate input including optional image
        $validator = Validator::make($request->all(), [
            'name'          => 'required|string|max:255',
            'phone_number'  => 'required|string|min:10|max:15|unique:users,phone_number,' . $user->id,
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        try {
            $user->name = $request->name;
            $user->phone_number = $request->phone_number;

            // ✅ If profile image was uploaded
            if ($request->hasFile('profile_image')) {
                $path = $request->file('profile_image')->store('uploads/riders', 'public');
                $user->profile_image = $path;
            }

            $user->save();

            return ResponseHelper::success("Profile updated successfully", [
                'name'          => $user->name,
                'phone_number'  => $user->phone_number,
                'profile_image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
            ]);
        } catch (\Exception $e) {
            return ResponseHelper::error("Failed to update profile. " . $e->getMessage(), 500);
        }
    }

    // public function uploadProfileImage(Request $request)
    // {
    //     $request->validate([
    //         'profile_image' => 'required|image|max:2048',
    //     ]);

    //     $user = $request->user();

    //     $path = $request->file('profile_image')->store('profile_images', 'public');

    //     $user->profile_image = $path;
    //     $user->save();

    //     return response()->json(['success' => true, 'message' => 'Profile image updated.', 'image_url' => asset('storage/' . $path)]);
    // }

    public function updateVehicle(Request $request)
    {
        $user = auth()->user();

        // ✅ Check if the user is a rider
        if ($user->role !== 'rider') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access',
            ], 403);
        }

        // ✅ Validate the input
        $validator = Validator::make($request->all(), [
            'vehicle_type' => 'required|string|in:motorcycle,car,bicycle',
            'plate_number' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // ✅ Update the rider's vehicle info
            $user->update([
                'vehicle_type' => $request->vehicle_type,
                'plate_number' => $request->plate_number,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Vehicle info updated successfully',
                'data' => [
                    'vehicle_type' => $user->vehicle_type,
                    'plate_number' => $user->plate_number,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function uploadLicenseImage(Request $request)
    {
        // Validate that a license image is uploaded and it's an image
        $request->validate([
            'license_image' => 'required|image|max:2048',  // Ensure the uploaded file is an image
        ]);

        // Get the currently authenticated user
        $user = $request->user();

        try {
            // Handle the file upload
            if ($request->hasFile('license_image')) {
                // Store the file in the 'license_images' directory within the 'public' disk
                $path = $request->file('license_image')->store('license_images', 'public');

                // Log the activity of the document upload with the old and new values (if applicable)
                activity()
                    ->performedOn($user)
                    ->withProperties([
                        'old_license' => $user->getOriginal('license_image'),  // Get the old license image if it exists
                        'new_license' => $path,  // The new uploaded license image
                    ])
                    ->log('Uploaded new license image');

                // Save the new license image path to the user's record
                $user->license_image = $path;
                $user->save();

                // Return the response with success message and URL to the uploaded image
                return response()->json([
                    'success' => true,
                    'message' => 'License image uploaded.',
                    'image_url' => asset('storage/' . $path) // Full URL to the uploaded image
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No file uploaded.'
                ], 400);
            }
        } catch (\Exception $e) {
            // Handle any exceptions that might occur during the file upload
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload license image: ' . $e->getMessage()
            ], 500);
        }
    }
}
