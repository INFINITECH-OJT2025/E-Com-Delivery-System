<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class PromoUsage extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['user_id', 'promo_id', 'used_at'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Promo usage was {$eventName}");
    }
    protected $fillable = [
        'user_id',
        'promo_id',
        'used_at',
    ];

    protected $casts = [
        'used_at' => 'datetime',
    ];

    /**
     * Relationship: Link to promo
     */
    public function promo()
    {
        return $this->belongsTo(Promo::class);
    }

    /**
     * Relationship: Link to user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
