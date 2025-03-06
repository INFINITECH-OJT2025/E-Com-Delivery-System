<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GoogleMapsController extends Controller
{
    /**
     * ✅ Get Address from Latitude & Longitude (Reverse Geocoding)
     */
    public function getAddressFromCoords(Request $request)
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $apiKey = env('GOOGLE_MAPS_API_KEY');

        if (!$lat || !$lng) {
            return response()->json(['error' => 'Latitude and Longitude are required.'], 400);
        }

        $response = Http::get("https://maps.googleapis.com/maps/api/geocode/json", [
            'latlng' => "$lat,$lng",
            'key' => $apiKey,
        ]);

        return response()->json($response->json());
    }

    /**
     * ✅ Get Distance & Duration Between Two Locations
     */
    public function getDistance(Request $request)
    {
        $origin = $request->query('origin');
        $destination = $request->query('destination');
        $apiKey = env('GOOGLE_MAPS_API_KEY');

        if (!$origin || !$destination) {
            return response()->json(['error' => 'Origin and Destination are required.'], 400);
        }

        $response = Http::get("https://maps.googleapis.com/maps/api/distancematrix/json", [
            'origins' => $origin,
            'destinations' => $destination,
            'key' => $apiKey,
        ]);

        return response()->json($response->json());
    }

    /**
     * ✅ Get Autocomplete Predictions
     */
    public function getAutocompleteResults(Request $request)
    {
        $input = $request->query('input');
        $apiKey = env('GOOGLE_MAPS_API_KEY');

        if (!$input) {
            return response()->json(['error' => 'Input query is required.'], 400);
        }

        $response = Http::get("https://maps.googleapis.com/maps/api/place/autocomplete/json", [
            'input' => $input,
            'key' => $apiKey,
            'types' => 'geocode',
        ]);

        return response()->json($response->json());
    }
}
