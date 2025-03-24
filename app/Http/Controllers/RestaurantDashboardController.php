<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Restaurant;
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

    public function recentOrders()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();
        $recentOrders = Order::where('restaurant_id', $restaurant->id)
            ->latest()
            ->take(5)
            ->get();

        return response()->json(['recentOrders' => $recentOrders]);
    }
    public function topSellingMenus()
    {
        $restaurant = Restaurant::where('owner_id', auth()->id())->firstOrFail();

        $topMenus = \DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->select('menus.name', \DB::raw('SUM(order_items.quantity) as total_sold'))
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

        $stats = \DB::table('payments')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->select('payment_method', \DB::raw('COUNT(*) as total'))
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
}
