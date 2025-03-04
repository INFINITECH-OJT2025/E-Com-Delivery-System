<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'user_id', 'status', 'amount', 'reason'];

    /**
     * Relationship: Refund belongs to an order.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Relationship: Refund belongs to a user (customer).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
