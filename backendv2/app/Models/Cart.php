<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Cart extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['user_id', 'restaurant_id'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Cart with ID {$this->id} was {$eventName}");
    }

    protected $fillable = [
        'user_id',
        'restaurant_id',
    ];

    /**
     * ✅ A cart belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * ✅ A cart belongs to a restaurant.
     */
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * ✅ A cart has many cart items.
     */
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
}
