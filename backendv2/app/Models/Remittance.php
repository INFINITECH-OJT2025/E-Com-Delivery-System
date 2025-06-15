<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Remittance extends Model
{
    use HasFactory;

    protected $fillable = [
        'rider_id',
        'amount',
        'expected_amount',
        'remit_date',
        'status',
        'notes',
        'is_short',
        'short_reason',
        'approved_by',
    ];

    protected $casts = [
        'remit_date' => 'datetime',
    ];

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
