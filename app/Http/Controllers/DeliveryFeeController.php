<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Restaurant;
use App\Services\DeliveryService;
use Illuminate\Http\Request;

class DeliveryFeeController extends Controller
{
    /**
     * ✅ Calculate Delivery Fee for a Specific Restaurant
     */
    public function calculateFee(Request $request, $restaurantId)
    {
        $latitude = $request->query('lat');
        $longitude = $request->query('lng');

        // ❌ No location provided
        if (!$latitude || !$longitude) {
            return ResponseHelper::error("Location required", 400);
        }

        // ✅ Find the restaurant
        $restaurant = Restaurant::findOrFail($restaurantId);

        // ✅ Use Service Class to Calculate Distance
        $distance = DeliveryService::calculateDistance($latitude, $longitude, $restaurant->latitude, $restaurant->longitude);

        // ✅ Use Service Class to Calculate Delivery Fee
        $deliveryFee = DeliveryService::calculateDeliveryFee($distance, $restaurant->base_delivery_fee);

        // ✅ Use Service Class to Estimate Delivery Time
        $estimatedTime = DeliveryService::estimateDeliveryTime($distance);

        return ResponseHelper::success("Delivery fee calculated", [
            'restaurant_id' => $restaurantId,
            'distance_km' => round($distance, 2),
            'delivery_fee' => $deliveryFee,
            'estimated_time' => $estimatedTime,
        ]);
    }
}
