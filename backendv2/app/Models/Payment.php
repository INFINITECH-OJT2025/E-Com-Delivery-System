<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Payment extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['order_id', 'user_id', 'amount', 'payment_method', 'payment_status', 'transaction_id'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Payment with ID {$this->id} was {$eventName}");
    }
    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'payment_method',
        'payment_status',
        'transaction_id'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
