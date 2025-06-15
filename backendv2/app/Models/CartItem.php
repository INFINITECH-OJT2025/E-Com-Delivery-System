<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CartItem extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['cart_id', 'menu_id', 'quantity', 'price', 'subtotal'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Cart item with ID {$this->id} was {$eventName}");
    }
    protected $fillable = [
        'cart_id',
        'menu_id',
        'quantity',
        'price',
        'subtotal'
    ];

    /**
     * ✅ A cart item belongs to a cart.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class, 'cart_id');
    }

    /**
     * ✅ A cart item belongs to a menu item.
     */
    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}
