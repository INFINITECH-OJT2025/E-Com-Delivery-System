<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CustomerAddress extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['user_id', 'label', 'address', 'latitude', 'longitude', 'is_default', 'notes'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Customer address was {$eventName}");
    }

    protected $fillable = [
        'user_id',
        'label',
        'address',
        'latitude',
        'longitude',
        'is_default',
        'notes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
