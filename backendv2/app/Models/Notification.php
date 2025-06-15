<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Notification extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['user_id', 'message', 'type', 'is_read'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Notification with ID {$this->id} was {$eventName}");
    }
    protected $fillable = ['user_id', 'message', 'type', 'is_read'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
