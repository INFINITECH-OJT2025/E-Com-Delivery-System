<?php

namespace App\Http\Controllers;

use App\Models\Remittance;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class RemittanceController extends Controller
{
    public function index()
    {
        $remittances = Remittance::with(['rider', 'approver'])->latest()->get();
        return response()->json(['remittances' => $remittances]);
    }

    public function store(Request $request)
    {
        // Validate incoming data
        $request->validate([
            'rider_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
            'remit_date' => 'required|date',
            'status' => 'required|in:complete,short',
            'expected_amount' => 'required|numeric|min:0', // Added validation for expected_amount
            'notes' => 'nullable|string',
            'short_reason' => 'nullable|string',
            'proof_image' => 'nullable|image|max:2048', // Image validation
        ]);

        // Find the rider
        $rider = User::findOrFail($request->rider_id);

        // Get the last remittance record for the rider
        $lastRemit = Remittance::where('rider_id', $rider->id)->latest('remit_date')->first();
        $lastDate = $lastRemit ? Carbon::parse($lastRemit->remit_date) : Carbon::createFromTimestamp(0);

        // Calculate total earnings (you may want to adjust this based on delivery fees or other factors)
        $totalEarnings = Order::where('delivery_rider_id', $rider->id)
            ->where('order_status', 'completed')
            ->where('updated_at', '>', $lastDate)
            ->sum('delivery_fee'); // Ensure you're calculating delivery fee for the earnings

        // Calculate the expected amount based on delivery fees
        $expected = round($totalEarnings * 0.10, 2); // Adjust this calculation if necessary
        $isShort = $request->amount < $expected;

        // Create the remittance record
        $remittance = Remittance::create([
            'rider_id' => $rider->id,
            'amount' => $request->amount,
            'expected_amount' => $request->expected_amount, // Save expected_amount
            'remit_date' => $request->remit_date,
            'status' => $isShort ? 'short' : 'completed',
            'notes' => $request->notes,
            'is_short' => $isShort,
            'short_reason' => $isShort ? ($request->short_reason ?? 'System marked as short') : null,
            'approved_by' => Auth::id(),
        ]);

        // Handle file upload
        if ($request->hasFile('proof_image')) {
            $path = $request->file('proof_image')->store('remittances', 'public');
            $remittance->proof_image = $path;
            $remittance->save();
        }

        return response()->json(['message' => 'Remittance created', 'remittance' => $remittance]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,completed,disputed',
            'short_reason' => 'nullable|string',
        ]);

        $remittance = Remittance::findOrFail($id);
        $remittance->status = $request->status;
        $remittance->short_reason = $request->short_reason ?? $remittance->short_reason;
        $remittance->approved_by = Auth::id();
        $remittance->save();

        return response()->json(['message' => 'Updated', 'remittance' => $remittance]);
    }

    public function show($id)
    {
        $remittance = Remittance::with(['rider', 'approver'])->findOrFail($id);
        return response()->json(['remittance' => $remittance]);
    }
    public function expected(Request $request)
    {
        $riderId = $request->query('rider_id');

        if (!$riderId) {
            return response()->json(['error' => 'rider_id is required'], 400);
        }

        // Use actual remittance timestamp (not just date)
        $lastRemit = Remittance::where('rider_id', $riderId)
            ->latest('created_at')
            ->first();

        $lastDate = $lastRemit ? Carbon::parse($lastRemit->created_at) : Carbon::createFromTimestamp(0);

        $orders = Order::where('delivery_rider_id', $riderId)
            ->where('order_status', 'completed')
            ->where('updated_at', '>', $lastDate);

        $deliveryFees = $orders->sum('delivery_fee');

        $expected = round($deliveryFees * 0.10, 2); // 10% commission

        return response()->json([
            'expected' => $expected,
            'delivery_fees_total' => $deliveryFees,
            'last_remit_date' => $lastRemit ? $lastRemit->remit_date : null,
            'orders_count' => $orders->count(),
        ]);
    }
}
