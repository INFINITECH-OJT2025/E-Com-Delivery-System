<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Delivery;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class RiderAnalyticsController extends Controller
{
    public function topZones(Request $request)
    {
        $riderId = auth()->id();
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $radius = 5; // KM radius (you can make this dynamic too)

        $topZonesQuery = DB::table('deliveries')
            ->join('orders', 'deliveries.order_id', '=', 'orders.id')
            ->join('customer_addresses', 'orders.customer_address_id', '=', 'customer_addresses.id')
            ->select(
                'customer_addresses.address as zone',
                DB::raw('COUNT(*) as count'),
                DB::raw('AVG(customer_addresses.latitude) as lat'),
                DB::raw('AVG(customer_addresses.longitude) as lng')
            )
            ->where('deliveries.rider_id', $riderId)
            ->groupBy('customer_addresses.address')
            ->orderByDesc('count');

        // ✅ Only filter if location is provided
        if ($lat && $lng) {
            $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(customer_addresses.latitude)) * cos(radians(customer_addresses.longitude) - radians(?)) + sin(radians(?)) * sin(radians(customer_addresses.latitude))))";
            $topZonesQuery->havingRaw("$haversine < ?", [$lat, $lng, $lat, $radius]);
        }

        $topZones = $topZonesQuery->limit(5)->get();

        return response()->json([
            'status' => 'success',
            'data' => $topZones,
        ]);
    }

    public function peakHours(Request $request)
    {
        $riderId = auth()->id();

        $hours = Delivery::where('rider_id', $riderId)
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as count'))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        return response()->json(['success' => true, 'data' => $hours]);
    }

    public function completionRate(Request $request)
    {
        $riderId = auth()->id();

        $total = Delivery::where('rider_id', $riderId)->count();
        $completed = Delivery::where('rider_id', $riderId)->where('status', 'delivered')->count();

        $rate = $total > 0 ? round(($completed / $total) * 100, 2) : 0;

        return response()->json(['success' => true, 'data' => ['completion_rate' => $rate]]);
    }

    public function earningsTrend(Request $request)
    {
        $riderId = auth()->id();

        $earnings = Delivery::with('order')
            ->where('rider_id', $riderId)
            ->where('status', 'delivered')
            ->join('orders', 'deliveries.order_id', '=', 'orders.id')
            ->select(DB::raw('DATE(deliveries.created_at) as date'), DB::raw('SUM(orders.delivery_fee) as total'))
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(7)
            ->get();

        return response()->json(['success' => true, 'data' => $earnings]);
    }
}
