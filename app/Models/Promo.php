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
}
