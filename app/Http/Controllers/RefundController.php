<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Refund;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class RefundController extends Controller
{
    /**
     * ✅ Fetch all refund requests for the authenticated user
     */
    public function index()
    {
        $user = Auth::user();

        $refunds = Refund::where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'refunds' => $refunds,
        ]);
    }

    /**
     * ✅ Store a new refund request (Users request refunds)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'reason' => 'required|string|max:500',
            'image_proof' => 'required|image|mimes:jpeg,png,jpg|max:2048', // ✅ Image required
        ]);

        $user = Auth::user();
        $order = Order::where('id', $validated['order_id'])
            ->where('customer_id', $user->id)
            ->where('order_status', 'completed') // ✅ Only completed orders
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Refund can only be requested for completed orders.',
            ], 403);
        }

        // ✅ Store Image Proof
        $imagePath = $request->file('image_proof')->store('refunds', 'public');

        // ✅ Create Refund Request
        $refund = Refund::create([
            'order_id' => $validated['order_id'],
            'user_id' => $user->id,
            'status' => 'pending',
            'admin_status' => 'pending',
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'image_proof' => $imagePath, // ✅ Save proof image
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Refund request submitted successfully.',
            'refund' => $refund,
        ], 201);
    }

    /**
     * ✅ Show a single refund request
     */
    public function show($id)
    {
        $refund = Refund::findOrFail($id);

        return response()->json([
            'success' => true,
            'refund' => $refund,
        ]);
    }

    /**
     * ✅ Update refund status (Admin Approves or Denies Refund)
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'admin_status' => 'required|in:approved,denied',
            'admin_response' => 'nullable|string|max:500',
        ]);

        $refund = Refund::findOrFail($id);

        // ✅ Only admins can approve or deny refunds
        if (Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to approve refunds.',
            ], 403);
        }

        $refund->update([
            'admin_status' => $validated['admin_status'],
            'admin_response' => $validated['admin_response'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Refund status updated.',
            'refund' => $refund,
        ]);
    }

    // Get all refunds for the vendor
    public function getRefunds(Request $request)
    {
        $vendor = $request->user();
        $refunds = Refund::where('restaurant_id', $vendor->restaurant->id)->get();
        return response()->json($refunds);
    }

    // Update refund status
    public function updateRefundStatus(Request $request, $id)
    {
        $refund = Refund::findOrFail($id);
        $refund->status = $request->input('status');
        $refund->save();

        return response()->json(['message' => 'Refund status updated successfully.']);
    }
}
