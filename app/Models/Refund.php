<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Refund extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['order_id', 'user_id', 'status', 'amount', 'reason'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Refund was {$eventName}");
    }
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
