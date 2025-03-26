<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'restaurant_id' => 'required|exists:restaurants,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'restaurant_id' => $request->restaurant_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // ✅ Recalculate restaurant average rating
        $avgRating = Review::where('restaurant_id', $request->restaurant_id)->avg('rating');
        Restaurant::where('id', $request->restaurant_id)->update(['rating' => $avgRating]);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully.',
            'data' => $review,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
    /**
     * Get all reviews for the vendor's restaurants.
     */
    public function getVendorReviews(Request $request)
    {
        $vendorId = Auth::id();

        // Fetch all restaurants owned by this vendor.
        $restaurantIds = Restaurant::where('owner_id', $vendorId)->pluck('id');

        // Fetch reviews for these restaurants.
        $reviews = Review::with('user')
            ->whereIn('restaurant_id', $restaurantIds)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'reviews' => $reviews,
            ]
        ]);
    }

    /**
     * Get review insights: average rating, total reviews, and trend breakdown.
     */
    public function getVendorReviewInsights(Request $request)
    {
        $vendorId = Auth::id();

        // Fetch the vendor's restaurants.
        $restaurantIds = Restaurant::where('owner_id', $vendorId)->pluck('id');

        // Get all reviews for these restaurants.
        $reviews = Review::whereIn('restaurant_id', $restaurantIds)->get();

        $total = $reviews->count();
        $average = $total > 0 ? round($reviews->avg('rating'), 2) : 0;

        // Create an array for star counts: index 0 = 1⭐, index 1 = 2⭐, ..., index 4 = 5⭐.
        $trend = [0, 0, 0, 0, 0];
        foreach ($reviews as $review) {
            $rating = $review->rating;
            if ($rating >= 1 && $rating <= 5) {
                $trend[$rating - 1]++;
            }
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'average' => $average,
                'total'   => $total,
                'trend'   => $trend,
            ]
        ]);
    }
}
