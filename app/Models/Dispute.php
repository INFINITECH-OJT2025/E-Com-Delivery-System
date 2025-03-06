<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'user_id', 'status', 'message'];

    /**
     * Relationship: Dispute belongs to an order.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Relationship: Dispute belongs to a user (customer).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
