<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'address',
        'latitude',
        'longitude',
        'is_default'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
