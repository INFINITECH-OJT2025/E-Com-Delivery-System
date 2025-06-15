<?php

namespace App\Services;

class DeliveryService
{
    /**
     * ✅ Calculate Distance Using Haversine Formula
     * 
     * Uses the Haversine formula to compute the great-circle distance between two points.
     * - **Returns:** Distance in kilometers (km)
     * - **Ensures safe calculations** by preventing NaN values for very close points.
     */
    public static function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371; // Radius of the Earth in km

        $lat1 = deg2rad($lat1);
        $lng1 = deg2rad($lng1);
        $lat2 = deg2rad($lat2);
        $lng2 = deg2rad($lng2);

        $dLat = $lat2 - $lat1;
        $dLng = $lng2 - $lng1;

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos($lat1) * cos($lat2) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        $distanceKm = $earthRadius * $c;

        return round($distanceKm, 2); // ✅ Ensure distance is always in KM
    }

    /**
     * ✅ Calculate Delivery Fee Based on Distance
     * 
     * - **Base Fee:** Applied for distances within `baseKmLimit` km.
     * - **Additional Fee:** Charged per km beyond `baseKmLimit`.
     * - **Easily adjustable parameters** for business needs.
     * 
     * ⚠️ **This pricing model is subject to change based on business decisions.**
     * 
     * @param float $distanceKm   Distance in kilometers
     * @param float $minimumFee   Default minimum fee (₱49)
     * @param int   $baseKmLimit  Max km for base fee (default 2 km)
     * @param float $extraPerKm   Additional fee per km beyond base limit (default ₱10/km)
     * 
     * @return float Delivery fee (rounded up)
     */
    public static function calculateDeliveryFee($distanceKm, $minimumFee = 49, $baseKmLimit = 2, $extraPerKm = 10)
    {
        if ($distanceKm <= $baseKmLimit) return $minimumFee;

        $additionalFee = ($distanceKm - $baseKmLimit) * $extraPerKm;
        return ceil($minimumFee + $additionalFee); // ✅ Always rounds up
    }

    /**
     * ✅ Estimate Delivery Time Based on Distance
     * 
     * - Base Preparation Time: **15 min**
     * - Travel Time: **3 min per km**
     * - Buffer Time: **+10 min**
     * 
     * **Final estimated delivery time range:**
     * - **Min Time** = Preparation time + Travel time
     * - **Max Time** = Min Time + Buffer
     * 
     * ⚠️ **Time estimates can be adjusted based on traffic conditions, business logic, and real-time data.**
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
