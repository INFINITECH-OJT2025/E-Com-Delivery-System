<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'restaurant_id',
        'delivery_rider_id',
        'customer_address_id',
        'total_price',
        'order_status',
        'payment_status',
        'scheduled_time',
        'rider_tip',
        'order_type',
        'subtotal',
        'delivery_fee',
        'discount_on_subtotal',
        'discount_on_shipping',
        'used_promo_id', // ✅ Added used_promo_id to fillable attributes
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'delivery_rider_id');
    }

    public function address()
    {
        return $this->belongsTo(CustomerAddress::class, 'customer_address_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'order_id', 'id'); // ✅ Ensure correct foreign key
    }

    public function dispute()
    {
        return $this->hasOne(Dispute::class);
    }

    public function refund()
    {
        return $this->hasOne(Refund::class);
    }
    /**
     * ✅ Check if a refund should be processed
     */
    public function shouldProcessRefund(): bool
    {
        return $this->payment && $this->payment->payment_status === 'success' && $this->payment_method !== 'cash';
    }

    /**
     * ✅ Define the relationship between Order and Customer Address
     */
    public function customerAddress(): BelongsTo
    {
        return $this->belongsTo(CustomerAddress::class, 'customer_address_id', 'id'); // ✅ Correctly link to `customer_addresses` table
    }


    public function delivery()
    {
        return $this->hasOne(Delivery::class, 'order_id');
    }
    public function usedPromo()
    {
        return $this->belongsTo(Promo::class, 'used_promo_id');
    }
}
