<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Helpers\ResponseHelper;

class UserController extends Controller
{
    /**
     * ✅ Get All Users (Admin Only)
     */
    public function index()
    {
        $users = User::all();
        return ResponseHelper::success("Users retrieved", $users);
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
     * ✅ Delete a User (Admin Only)
     */
    public function destroy(User $user)
    {
        $user->delete();
        return ResponseHelper::success("User deleted");
    }
}
