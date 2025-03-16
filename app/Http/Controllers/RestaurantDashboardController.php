<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Restaurant;
use Illuminate\Http\Request;

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
}
