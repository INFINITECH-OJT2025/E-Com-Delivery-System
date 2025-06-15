<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    public function index()
    {
        $logs = DB::table('activity_log')
            ->orderBy('created_at', 'desc')
            ->get(); // ⚡ no pagination

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}
