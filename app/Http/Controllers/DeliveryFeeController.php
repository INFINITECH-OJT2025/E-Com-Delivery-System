<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Restaurant;
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

        // ✅ Calculate distance
        $distance = $this->calculateDistance($latitude, $longitude, $restaurant->latitude, $restaurant->longitude);

        // ✅ Calculate delivery fee (always a whole number)
        $deliveryFee = $this->calculateDeliveryFee($distance, $restaurant->base_delivery_fee);

        return ResponseHelper::success("Delivery fee calculated", [
            'restaurant_id' => $restaurantId,
            'distance_km' => round($distance, 2),
            'delivery_fee' => $deliveryFee,
        ]);
    }

    /**
     * ✅ Calculate Distance Using Haversine Formula
     */
    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        return 6371 * acos(
            cos(deg2rad($lat1)) * cos(deg2rad($lat2))
                * cos(deg2rad($lng2) - deg2rad($lng1))
                + sin(deg2rad($lat1)) * sin(deg2rad($lat2))
        );
    }

    /**
     * ✅ Calculate Delivery Fee Based on Distance (Always Whole Number)
     */
    private function calculateDeliveryFee($distanceKm, $baseFee = 50)
    {
        if ($distanceKm <= 2) return $baseFee;

        $additionalFee = ($distanceKm - 2) * 10;
        return ceil($baseFee + $additionalFee); // ✅ Always rounds up to a whole number
    }
}
