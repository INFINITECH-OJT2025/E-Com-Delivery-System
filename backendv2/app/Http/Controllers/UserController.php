<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Helpers\ResponseHelper;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * ✅ Get All Users (Admin Only)
     */
    /**
     * ✅ Get all users with pagination & filtering
     */
    public function index(Request $request)
    {
        $query = User::query();

        // ✅ Apply Search Filter (Only if Not Empty)
        if (!empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                    ->orWhere('email', 'LIKE', "%{$request->search}%")
                    ->orWhere('role', 'LIKE', "%{$request->search}%");
            });
        }

        // ✅ Apply Status Filter (Only if Not Empty)
        if (!empty($request->status)) {
            $query->where('status', $request->status);
        }

        // ✅ Apply Sorting (Ensure column exists to prevent SQL errors)
        $allowedColumns = ['id', 'name', 'email', 'status', 'role', 'created_at']; // ✅ Allowed sorting columns
        $sortColumn = in_array($request->input('sortColumn'), $allowedColumns) ? $request->input('sortColumn') : 'created_at';
        $sortDirection = $request->input('sortDirection') === 'desc' ? 'desc' : 'asc';

        $query->orderBy($sortColumn, $sortDirection);

        // ✅ Get paginated results (10 per page)
        $users = $query->paginate(10);

        return response()->json([
            'status' => 'success',
            'message' => 'Users retrieved successfully',
            'data' => $users
        ], 200);
    }


    /**
     * ✅ Get a Specific User (Admin Only)
     */
    public function show(User $user)
    {
        return ResponseHelper::success("User retrieved", $user);
    }

    /**
     * ✅ Update a User's Details (Admin Only)
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|string|max:15',
        ]);

        $user->update($request->only(['name', 'phone_number']));

        return ResponseHelper::success("User updated", $user);
    }


    /**
     * ✅ Update user status (Pending, Approved, Banned)
     */
    public function updateStatus(Request $request, $id)
    {
        // ✅ Find the user
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }

        // ✅ Validate request
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,banned'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first() // Only return the first error
            ], 422);
        }

        // ✅ Update the user's status
        $user->status = $request->status;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "User status updated to {$request->status}",
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status,
                'role' => $user->role
            ]
        ], 200);
    }

    /**
     * ✅ Delete a user (Soft delete for safety)
     */
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
        }

        $user->delete(); // Soft delete (Modify for permanent deletion if needed)

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully'
        ], 200);
    }
}
