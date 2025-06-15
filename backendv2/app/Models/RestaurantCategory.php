<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class RestaurantCategory extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'slug'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Restaurant category with ID {$this->id} was {$eventName}");
    }

    protected $fillable = ['name', 'slug'];
    public static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            $category->slug = Str::slug($category->name); // ✅ Automatically generate slug
        });
    }
    public function restaurants()
    {
        return $this->hasMany(Restaurant::class);
    }
}
