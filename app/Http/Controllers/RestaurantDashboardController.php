<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Order;
use App\Models\Restaurant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RestaurantDashboardController extends Controller
{
    public function totalOrders()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();
        $totalOrders = Order::where('restaurant_id', $restaurant->id)->count();

        return response()->json(['totalOrders' => $totalOrders]);
    }

    public function pendingOrders()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();
        $pendingOrders = Order::where('restaurant_id', $restaurant->id)
            ->where('order_status', 'pending')
            ->count();

        return response()->json(['pendingOrders' => $pendingOrders]);
    }

    public function totalRevenue()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();
        $totalRevenue = Order::where('restaurant_id', $restaurant->id)
            ->where('order_status', 'completed')
            ->sum('total_price');

        return response()->json(['totalRevenue' => $totalRevenue]);
    }

    // public function recentOrders()
    // {
    //     $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();
    //     $recentOrders = Order::where('restaurant_id', $restaurant->id)
    //         ->latest()
    //         ->take(5)
    //         ->get();

    //     return response()->json(['recentOrders' => $recentOrders]);
    // }
    public function topSellingMenus()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();

        $topMenus = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->select('menus.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('order_items.menu_id', 'menus.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return response()->json(['topMenus' => $topMenus]);
    }
    public function mostSearchedKeywords()
    {
        $keywords = DB::table('search_keywords')
            ->orderByDesc('search_count')
            ->limit(5)
            ->get(['keyword', 'search_count']);

        return response()->json(['keywords' => $keywords]);
    }
    public function averageRating()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();

        $avgRating = DB::table('reviews')
            ->where('restaurant_id', $restaurant->id)
            ->avg('rating');

        return response()->json(['averageRating' => round($avgRating, 2)]);
    }
    public function orderTrendsByHour()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();

        $trends = Order::where('restaurant_id', $restaurant->id)
            ->selectRaw('HOUR(created_at) as hour, COUNT(*) as total')
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return response()->json(['orderTrendsByHour' => $trends]);
    }
    public function orderTypeDistribution()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();

        $data = Order::where('restaurant_id', $restaurant->id)
            ->selectRaw('order_type, COUNT(*) as count')
            ->groupBy('order_type')
            ->get();

        return response()->json(['orderTypeDistribution' => $data]);
    }
    public function paymentMethodStats()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();

        $stats = DB::table('payments')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->select('payment_method', DB::raw('COUNT(*) as total'))
            ->groupBy('payment_method')
            ->get();

        return response()->json(['paymentMethods' => $stats]);
    }
    public function refundSummary()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();

        $refunds = DB::table('refunds')
            ->join('orders', 'refunds.order_id', '=', 'orders.id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get();

        return response()->json(['refundStats' => $refunds]);
    }
    private function vendorRestaurant()
    {
        return Restaurant::where('owner_id', auth()->id())->firstOrFail();
    }

    public function overview()
    {
        $restaurant = $this->vendorRestaurant();

        // All orders
        $orders = Order::where('restaurant_id', $restaurant->id);
        $totalOrders = $orders->count();
        $totalRevenue = $orders->sum('total_price');
        $avgOrderValue = $totalOrders ? round($totalRevenue / $totalOrders, 2) : 0;
        $averageRating = $restaurant->reviews()->avg('rating') ?? 0;

        // 🗓️ Orders Today
        $todayOrders = Order::where('restaurant_id', $restaurant->id)
            ->whereDate('created_at', now())
            ->get();

        $todayTotal = $todayOrders->count();
        $todayRevenue = $todayOrders->sum('total_price');
        $todayAOV = $todayTotal > 0 ? round($todayRevenue / $todayTotal, 2) : 0;

        // 📅 Orders Yesterday
        $yesterdayOrders = Order::where('restaurant_id', $restaurant->id)
            ->whereDate('created_at', now()->subDay())
            ->get();

        $yesterdayTotal = $yesterdayOrders->count();
        $yesterdayRevenue = $yesterdayOrders->sum('total_price');
        $yesterdayAOV = $yesterdayTotal > 0 ? round($yesterdayRevenue / $yesterdayTotal, 2) : 0;

        // 📊 Ratings last 7 days
        $lastWeekRating = $restaurant->reviews()
            ->whereDate('created_at', '>=', now()->subDays(7))
            ->avg('rating') ?? 0;

        // 📈 Calculate trends (safe fallback if 0)
        $trend = fn($today, $yesterday) =>
        $yesterday == 0 ? ($today > 0 ? 100 : 0) : round((($today - $yesterday) / $yesterday) * 100);

        return response()->json([
            'totalOrders' => $totalOrders,
            'totalRevenue' => $totalRevenue,
            'avgOrderValue' => $avgOrderValue,
            'averageRating' => round($averageRating, 1),

            'totalOrdersTrend' => $trend($todayTotal, $yesterdayTotal),
            'totalRevenueTrend' => $trend($todayRevenue, $yesterdayRevenue),
            'avgOrderValueTrend' => $trend($todayAOV, $yesterdayAOV),
            'averageRatingTrend' => round($averageRating - $lastWeekRating, 1),
        ]);
    }


    public function storeStatus()
    {
        $restaurant = $this->vendorRestaurant();

        $now = now()->format('H:i:s');

        $isOpen = true; // Default to open (24/7)

        if ($restaurant->opening_time && $restaurant->closing_time) {
            $isOpen = $restaurant->opening_time <= $now && $restaurant->closing_time >= $now;
        }

        return response()->json([
            'isOpen' => $isOpen,
            'openingTime' => $restaurant->opening_time,
            'closingTime' => $restaurant->closing_time,
        ]);
    }

    public function revenueOverview()
    {
        $restaurant = $this->vendorRestaurant();

        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $orders = Order::where('restaurant_id', $restaurant->id)
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->get();

        // Group by day number (1 - 31)
        $grouped = $orders->groupBy(fn($order) => Carbon::parse($order->created_at)->format('j'));

        // Generate full month day labels
        $daysInMonth = Carbon::now()->daysInMonth;
        $chart = collect(range(1, $daysInMonth))->map(function ($day) use ($grouped) {
            $dayOrders = $grouped->get($day, collect());
            return [
                'name' => str_pad($day, 2, '0', STR_PAD_LEFT), // e.g., "01", "02", ...
                'total' => $dayOrders->sum('total_price'),
            ];
        });

        return response()->json($chart);
    }

    public function ordersByStatus()
    {
        $restaurant = $this->vendorRestaurant();

        $statuses = Order::where('restaurant_id', $restaurant->id)
            ->selectRaw('order_status, count(*) as value')
            ->groupBy('order_status')
            ->get()
            ->map(fn($row) => [
                'name' => ucfirst(str_replace('_', ' ', $row->order_status)),
                'value' => $row->value,
            ]);

        return response()->json($statuses);
    }

    public function recentOrders()
    {
        $restaurant = $this->vendorRestaurant();

        $orders = Order::with('customer')
            ->where('restaurant_id', $restaurant->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($order) => [
                'id' =>  $order->id,
                'customer' => $order->customer->name ?? 'Unknown',
                'items' => $order->orderItems->sum('quantity'),
                'total' => $order->total_price,
                'status' => $order->order_status,
                'time' => $order->created_at->format('g:i A'),
            ]);

        return response()->json($orders);
    }


    public function popularItems()
    {
        $restaurant = $this->vendorRestaurant();

        $startOfThisMonth = Carbon::now()->startOfMonth();
        $endOfThisMonth = Carbon::now()->endOfMonth();

        $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
        $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();

        // Get top 5 items by orders THIS month
        $topItems = Menu::where('restaurant_id', $restaurant->id)
            ->withCount([
                'orderItems as orders' => function ($query) use ($startOfThisMonth, $endOfThisMonth) {
                    $query->whereBetween('created_at', [$startOfThisMonth, $endOfThisMonth])
                        ->select(DB::raw("COALESCE(SUM(quantity), 0)"));
                }
            ])
            ->orderByDesc('orders')
            ->take(5)
            ->get();

        // Get LAST month's orders grouped by menu_id
        $lastMonthOrders = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->select('menu_id', DB::raw('SUM(quantity) as total'))
            ->whereBetween('orders.created_at', [$startOfLastMonth, $endOfLastMonth])
            ->where('orders.restaurant_id', $restaurant->id)
            ->groupBy('menu_id')
            ->pluck('total', 'menu_id');

        // Format with real trend %
        $items = $topItems->map(function ($menu) use ($lastMonthOrders) {
            $thisMonth = (int) $menu->orders;
            $lastMonth = (int) ($lastMonthOrders[$menu->id] ?? 0);

            $trend = $lastMonth === 0
                ? ($thisMonth > 0 ? 100 : 0)
                : round((($thisMonth - $lastMonth) / $lastMonth) * 100);

            return [
                'name' => $menu->name,
                'orders' => (string) $thisMonth,
                'revenue' => number_format($thisMonth * $menu->price, 2),
                'trend' => $trend,
                'image' => $menu->image,
            ];
        });

        return response()->json($items);
    }


    public function performance()
    {
        $restaurant = $this->vendorRestaurant();

        // Get all orders for this restaurant
        $orders = Order::with('delivery')
            ->where('restaurant_id', $restaurant->id)
            ->get();

        $totalOrders = $orders->count();
        $acceptedOrders = $orders->whereIn('order_status', ['confirmed', 'preparing', 'out_for_delivery', 'completed'])->count();
        $onTimeDeliveries = $orders->filter(function ($order) {
            return $order->delivery &&
                $order->delivery->pickup_time &&
                $order->delivery->delivery_time &&
                Carbon::parse($order->delivery->pickup_time)->lt(Carbon::parse($order->delivery->delivery_time));
        })->count();

        $completedOrders = $orders->where('order_status', 'completed')->count();
        $cancelledOrders = $orders->where('order_status', 'canceled')->count();

        // Filter for valid pickup times
        $avgPrepTime = $orders->filter(function ($order) {
            return $order->delivery &&
                $order->delivery->pickup_time &&
                Carbon::parse($order->created_at)->lt(Carbon::parse($order->delivery->pickup_time));
        })->map(function ($order) {
            return Carbon::parse($order->delivery->pickup_time)->diffInMinutes(Carbon::parse($order->created_at));
        })->avg() ?? 0;

        // Filter for valid delivery durations
        $avgDeliveryTime = $orders->filter(function ($order) {
            return $order->delivery &&
                $order->delivery->pickup_time &&
                $order->delivery->delivery_time &&
                Carbon::parse($order->delivery->pickup_time)->lt(Carbon::parse($order->delivery->delivery_time));
        })->map(function ($order) {
            return Carbon::parse($order->delivery->delivery_time)->diffInMinutes(Carbon::parse($order->delivery->pickup_time));
        })->avg() ?? 0;

        return response()->json([
            'acceptanceRate' => $totalOrders > 0 ? round(($acceptedOrders / $totalOrders) * 100, 1) : 0,
            'onTimeDelivery' => $totalOrders > 0 ? round(($onTimeDeliveries / $totalOrders) * 100, 1) : 0,
            'satisfaction' => round($restaurant->reviews()->avg('rating') ?? 0, 1),
            'avgPrepTime' => round($avgPrepTime),
            'avgDeliveryTime' => round($avgDeliveryTime),
            'completedOrders' => $completedOrders,
            'cancellationRate' => $totalOrders > 0 ? round(($cancelledOrders / $totalOrders) * 100, 2) : 0,
        ]);
    }

    public function recentReviews()
    {
        $restaurant = $this->vendorRestaurant();

        $reviews = $restaurant->reviews()
            ->with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($review) => [
                'name' => $review->user->name ?? 'Anonymous',
                'rating' => $review->rating,
                'date' => $review->created_at->format('M j, g:i A'),
                'order' =>  $review->id, // Replace with order_id if related
                'content' => $review->comment,
            ]);

        return response()->json($reviews);
    }
}
