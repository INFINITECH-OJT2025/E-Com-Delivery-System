<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * ✅ Get Dashboard Statistics
     */
    public function getStats(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'restaurants' => Restaurant::count(),
                'users' => User::where('role', 'customer')->count(),
                'riders' => User::where('role', 'rider')->count(),
                'activeOrders' => Order::whereIn('order_status', ['pending', 'confirmed', 'preparing'])->count(),
            ]
        ]);
    }

    /**
     * ✅ Get Recent Orders
     */
    public function getRecentOrders(): JsonResponse
    {
        $orders = Order::latest()
            ->take(5)
            ->with(['customer:id,name', 'payment'])
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer' => $order->customer->name ?? 'Unknown',
                    'total' => number_format($order->total_price, 2),
                    'status' => ucfirst($order->order_status),
                    'payment_status' => ucfirst($order->payment->payment_status ?? 'Pending'),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    /**
     * ✅ Get Recent Registrations (Restaurants & Riders)
     */
    public function getRecentRegistrations(): JsonResponse
    {
        $restaurants = Restaurant::latest()->take(3)->get();
        $riders = User::where('role', 'rider')->latest()->take(3)->get();

        $registrations = collect($restaurants)->merge($riders)->sortByDesc('created_at')->map(function ($item) {
            return [
                'name' => $item->name,
                'type' => $item instanceof Restaurant ? 'Restaurant' : 'Rider',
                'date' => $item->created_at->format('F d, Y'),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $registrations->values()->all()
        ]);
    }
}
