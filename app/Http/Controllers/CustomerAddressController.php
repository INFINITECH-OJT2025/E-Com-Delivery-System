<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\CustomerAddress;
use App\Helpers\ResponseHelper;

class CustomerAddressController extends Controller
{
    /**
     * ✅ Fetch All User Addresses
     */
    public function index()
    {
        $user = Auth::user();
        $addresses = CustomerAddress::where('user_id', $user->id)->get();
        return ResponseHelper::success("Addresses retrieved", $addresses);
    }

    /**
     * ✅ Store a New Address
     */
    public function store(Request $request)
    {
        $request->validate([
            'label' => 'required|string|max:50',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'notes' => 'nullable|string', // ✅ Ensure `notes` is allowed
            'is_default' => 'boolean'
        ]);

        $user = Auth::user();

        // If new address is default, reset others
        if ($request->is_default) {
            CustomerAddress::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address = CustomerAddress::create([
            'user_id' => $user->id,
            'label' => $request->label,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'notes' => $request->notes, // ✅ Ensure `notes` is allowed
            'is_default' => $request->is_default ?? false
        ]);

        return ResponseHelper::success("Address added successfully", $address);
    }

    /**
     * ✅ Fetch a Single Address
     */
    public function show($id)
    {
        $user = Auth::user();
        $address = CustomerAddress::where('id', $id)->where('user_id', $user->id)->first();

        if (!$address) {
            return ResponseHelper::error("Address not found", 404);
        }

        return ResponseHelper::success("Address retrieved", $address);
    }

    /**
     * ✅ Update an Address
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'label' => 'sometimes|string|max:50',
            'address' => 'sometimes|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'notes' => 'nullable|string', // ✅ Ensure `notes` is allowed
            'is_default' => 'boolean'
        ]);

        $user = Auth::user();
        $address = CustomerAddress::where('id', $id)->where('user_id', $user->id)->first();

        if (!$address) {
            return ResponseHelper::error("Address not found", 404);
        }

        // If making this address default, reset others
        if ($request->has('is_default') && $request->is_default) {
            CustomerAddress::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address->update($request->only(['label', 'address', 'latitude', 'longitude', 'is_default']));

        return ResponseHelper::success("Address updated successfully", $address);
    }

    /**
     * ✅ Delete an Address
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $address = CustomerAddress::where('id', $id)->where('user_id', $user->id)->first();

        if (!$address) {
            return ResponseHelper::error("Address not found", 404);
        }

        // Prevent deleting default address if it's the only one
        if ($address->is_default && CustomerAddress::where('user_id', $user->id)->count() == 1) {
            return ResponseHelper::error("You must have at least one address", 400);
        }

        $address->delete();
        return ResponseHelper::success("Address deleted successfully");
    }
    /**
     * ✅ Set an Address as Default
     */
    public function setDefault($id)
    {
        $user = Auth::user();
        $address = CustomerAddress::where('id', $id)->where('user_id', $user->id)->first();

        if (!$address) {
            return ResponseHelper::error("Address not found", 404);
        }

        // Reset other addresses
        CustomerAddress::where('user_id', $user->id)->update(['is_default' => false]);

        // Set selected address as default
        $address->update(['is_default' => true]);

        return ResponseHelper::success("Default address set successfully", $address);
    }
}
