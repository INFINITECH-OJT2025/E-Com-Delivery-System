<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_percentage',
        'discount_amount',
        'minimum_order',
        'max_uses',
        'valid_until'
    ];
    protected $casts = [
        'valid_until' => 'datetime',
    ];

    /**
     * Relationship: Track users who used this promo
     */
    public function usages()
    {
        return $this->hasMany(PromoUsage::class);
    }

    /**
     * Check if a promo is still valid
     */
    public function isValid()
    {
        return !$this->isExpired() && $this->max_uses > $this->usages()->count();
    }

    /**
     * Check if promo is expired
     */
    public function isExpired()
    {
        return $this->valid_until && now()->gt($this->valid_until);
    }
}
