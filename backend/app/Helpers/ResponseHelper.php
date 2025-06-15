<?php

namespace App\Helpers;

class ResponseHelper
{
    public static function success($message = "Success", $data = [])
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], 200);
    }

    public static function error($message = "Error", $statusCode = 400, $data = [])
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }
}
