<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Message extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['chat_id', 'sender_id', 'message', 'is_read'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Message was {$eventName}");
    }
    protected $fillable = ['chat_id', 'sender_id', 'message', 'is_read'];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public static function getUnreadMessages($chatId)
    {
        return self::where('chat_id', $chatId)->where('is_read', false)->count();
    }
}
