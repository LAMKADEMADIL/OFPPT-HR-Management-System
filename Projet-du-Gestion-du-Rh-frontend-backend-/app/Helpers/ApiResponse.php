<?php

namespace App\Helpers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ApiResponse
{
    public static function success($data = null, string $message = 'Success', int $status = 200, array $meta = [])
    {
        // Resource or Collection?
        if ($data instanceof JsonResource) {
            $data = $data->response()->getData(true);
            $meta = array_merge($meta, $data['meta'] ?? []);
            $data = $data['data'] ?? $data;
        }

        // Paginator?
        if ($data instanceof LengthAwarePaginator) {
            $meta = array_merge($meta, [
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
                'per_page'     => $data->perPage(),
                'total'        => $data->total(),
            ]);
            $data = $data->items();
        }

        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
            'meta'    => (object) $meta
        ], $status);
    }

    public static function error(string $message = 'Error', int $status = 400, $errors = null)
    {
        return response()->json([
            'status'  => 'error',
            'message' => $message,
            'errors'  => $errors ?? (object) []
        ], $status);
    }
}