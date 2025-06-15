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

        // ✅ Ensure latitude/longitude are valid numbers
        if (!is_numeric($latitude) || !is_numeric($longitude)) {
            return ResponseHelper::error("Invalid location coordinates", 400);
        }

        // ✅ Use Service Class to Calculate Distance (Always Returns KM)
        $distance = round(DeliveryService::calculateDistance($latitude, $longitude, $restaurant->latitude, $restaurant->longitude), 2);

        // ✅ Ensure Base Fee is Set (Fallback to ₱49 if Null)
        $baseFee = $restaurant->base_delivery_fee ?? 49;

        // ✅ Use Service Class to Calculate Delivery Fee
        $deliveryFee = DeliveryService::calculateDeliveryFee($distance, $baseFee);

        // ✅ Use Service Class to Estimate Delivery Time
        $estimatedTime = DeliveryService::estimateDeliveryTime($distance);

        return ResponseHelper::success("Delivery fee calculated", [
            'restaurant_id' => $restaurantId,
            'distance_km' => $distance, // ✅ Ensures distance is correctly rounded
            'delivery_fee' => $deliveryFee,
            'estimated_time' => $estimatedTime,
        ]);
    }
}
