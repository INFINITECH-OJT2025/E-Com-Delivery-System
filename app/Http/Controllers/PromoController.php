<?php

namespace App\Http\Controllers;

use App\Models\Promo;
use App\Models\PromoUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ResponseHelper;
use Illuminate\Support\Facades\DB;

class PromoController extends Controller
{
    /**
     * ✅ GET: List all available vouchers (Public, No Auth Required)
     */
    public function index()
    {
        $promos = Promo::where('valid_until', '>=', Carbon::now()) // ✅ Only return valid promos
            ->orderBy('valid_until', 'desc')
            ->get();

        return ResponseHelper::success("Active promos retrieved successfully", $promos);
    }

    /**
     * ✅ POST: Apply a voucher (Customer use, Requires Auth)
     */
    public function applyPromo(Request $request)
    {
        // ✅ Validate required fields
        $request->validate([
            'code' => 'required|string',
            'order_total' => 'required|numeric|min:1', // ✅ Ensure order_total is always provided
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

        $userId = Auth::id(); // ✅ Get authenticated user ID

        // ❌ Prevent reusing one-time use vouchers
        $alreadyUsed = PromoUsage::where('user_id', $userId)
            ->where('promo_id', $promo->id)
            ->exists();

        if ($alreadyUsed) {
            return ResponseHelper::error("You have already used this promo.", 400);
        }

        // ✅ Calculate discount
        $discount = $promo->discount_percentage
            ? ($request->order_total * ($promo->discount_percentage / 100))
            : $promo->discount_amount;

        // ✅ Ensure discount does not exceed total
        $discount = min($discount, $request->order_total);
        $finalTotal = max(0, $request->order_total - $discount);

        // ✅ Use transactions for database integrity
        DB::beginTransaction();
        try {
            // ✅ Mark the promo as used
            PromoUsage::create([
                'user_id' => $userId,
                'promo_id' => $promo->id,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error("Failed to apply promo. Please try again.", 500);
        }

        return ResponseHelper::success("Promo applied successfully.", [
            'discount' => round($discount, 2),
            'final_total' => round($finalTotal, 2),
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
