<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Delivery extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['order_id', 'rider_id', 'pickup_time', 'delivery_time', 'status', 'current_lat', 'current_lng', 'proof_image'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Delivery for Order #{$this->order_id} was {$eventName}");
    }
    protected static $logAttributes = [
        'status',
        'pickup_time',
        'delivery_time',
        'current_lat',
        'current_lng',
        'proof_image',
    ];

    protected static $logOnlyDirty = true;
    protected static $logName = 'delivery';

    public function getDescriptionForEvent(string $eventName): string
    {
        return "Delivery for Order #{$this->order_id} was {$eventName}";
    }

    protected $fillable = [
        'order_id',
        'rider_id',
        'pickup_time',
        'delivery_time',
        'status',
        'current_lat',
        'current_lng',
        'proof_image', // Newly added proof image

    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }
}
