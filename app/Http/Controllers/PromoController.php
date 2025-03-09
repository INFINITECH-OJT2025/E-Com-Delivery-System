<?php

namespace App\Http\Controllers;

use App\Models\Promo;
use App\Models\PromoUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ResponseHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PromoController extends Controller
{
    /**
     * ✅ GET: List all available vouchers (Public, No Auth Required)
     */
    public function index()
    {
        $userId = Auth::id(); // ✅ Get authenticated user ID (nullable for guests)

        $promos = Promo::where('valid_until', '>=', Carbon::now()) // ✅ Only return valid promos
            ->orderBy('valid_until', 'desc')
            ->get()
            ->map(function ($promo) use ($userId) {
                $promo->used = $userId
                    ? PromoUsage::where('user_id', $userId)
                    ->where('promo_id', $promo->id)
                    ->exists()
                    : false; // ✅ Check if user has used this promo

                Log::info("Promo Check", [
                    'promo_id' => $promo->id,
                    'user_id' => $userId,
                    'used' => $promo->used
                ]);

                return $promo;
            });

        return ResponseHelper::success("Active promos retrieved successfully", $promos);
    }


    /**
     * ✅ POST: Check if a voucher is valid (No Tracking, Just Lookup)
     */
    public function applyPromo(Request $request)
    {
        // ✅ Validate required fields
        $request->validate([
            'code' => 'required|string',
            'order_total' => 'required|numeric|min:1', // ✅ Ensure order_total is provided
        ]);

        $promo = Promo::where('code', $request->code)->first();

        // ❌ Invalid promo code
        if (!$promo) {
            return ResponseHelper::error("Invalid promo code.", 400);
        }

        // ❌ Expired promo
        if ($promo->valid_until && Carbon::now()->gt($promo->valid_until)) {
            return ResponseHelper::error("This promo has expired.", 400);
        }

        // ❌ Minimum order requirement
        if ($promo->minimum_order && $request->order_total < $promo->minimum_order) {
            return ResponseHelper::error("Minimum order amount required: ₱{$promo->minimum_order}", 400);
        }

        // ✅ Calculate discount
        $discount = $promo->discount_percentage
            ? ($request->order_total * ($promo->discount_percentage / 100))
            : $promo->discount_amount;

        // ✅ Ensure discount does not exceed total
        $discount = min($discount, $request->order_total);
        $finalTotal = max(0, $request->order_total - $discount);

        // ✅ Simply return voucher details, no database updates
        return ResponseHelper::success("Promo verified successfully.", [
            'code' => $promo->code,
            'discount' => round($discount, 2),
            'final_total' => round($finalTotal, 2),
            'discount_percentage' => $promo->discount_percentage,
            'discount_amount' => $promo->discount_amount,
            'minimum_order' => $promo->minimum_order,
            'valid_until' => $promo->valid_until,
        ]);
    }


    /**
     * ✅ POST: Create a new voucher (Admin only)
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:promos,code',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'minimum_order' => 'nullable|numeric|min:0',
            'max_uses' => 'required|integer|min:1',
            'valid_until' => 'nullable|date',
        ]);

        $promo = Promo::create($request->all());
        return ResponseHelper::success("Promo created successfully", $promo);
    }

    /**
     * ✅ PUT/PATCH: Update a voucher (Admin only)
     */
    public function update(Request $request, Promo $promo)
    {
        $request->validate([
            'code' => 'sometimes|string|unique:promos,code,' . $promo->id,
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'minimum_order' => 'nullable|numeric|min:0',
            'max_uses' => 'required|integer|min:1',
            'valid_until' => 'nullable|date',
        ]);

        $promo->update($request->all());
        return ResponseHelper::success("Promo updated successfully", $promo);
    }

    /**
     * ✅ DELETE: Remove a voucher (Admin only)
     */
    public function destroy(Promo $promo)
    {
        $promo->delete();
        return ResponseHelper::success("Promo deleted successfully");
    }
}
