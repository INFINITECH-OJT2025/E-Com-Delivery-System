<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Chat extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['sender_id', 'receiver_id'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Chat between users was {$eventName}");
    }
    protected $fillable = ['sender_id', 'receiver_id'];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public static function getUserSupportChat($userId)
    {
        return self::where('sender_id', $userId)->first(); // Ensure only ONE chat per user
    }
}
