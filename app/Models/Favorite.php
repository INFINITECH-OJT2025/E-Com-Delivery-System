<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Favorite extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['user_id', 'favoritable_type', 'favoritable_id'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Favorite with ID {$this->id} was {$eventName}");
    }

    protected $fillable = ['user_id', 'favoritable_type', 'favoritable_id'];

    public function favoritable()
    {
        return $this->morphTo();
    }
}
