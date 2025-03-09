<?php

namespace App\Services;

class DeliveryService
{
    /**
     * ✅ Calculate Distance Using Haversine Formula
     */
    public static function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        return 6371 * acos(
            cos(deg2rad($lat1)) * cos(deg2rad($lat2))
                * cos(deg2rad($lng2) - deg2rad($lng1))
                + sin(deg2rad($lat1)) * sin(deg2rad($lat2))
        );
    }

    /**
     * ✅ Calculate Delivery Fee Based on Distance
     */
    public static function calculateDeliveryFee($distanceKm, $baseFee = 50)
    {
        if ($distanceKm <= 2) return $baseFee;

        $additionalFee = ($distanceKm - 2) * 10;
        return ceil($baseFee + $additionalFee); // ✅ Always rounds up
    }

    /**
     * ✅ Estimate Delivery Time Based on Distance
     */
    public static function estimateDeliveryTime($distanceKm)
    {
        $baseTime = 15; // ✅ Base preparation time (15 min)
        $travelTime = $distanceKm * 3; // ✅ Travel time (3 min per km)
        $minTime = ceil($baseTime + $travelTime);
        $maxTime = $minTime + 10; // ✅ Buffer of 10 min

        return "{$minTime} - {$maxTime} min";
    }
}
