<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Restaurant extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'owner_id',
                'name',
                'slug',
                'restaurant_category_id',
                'description',
                'logo',
                'banner_image',
                'address',
                'latitude',
                'longitude',
                'phone_number',
                'status',
                'rating',
                'service_type',
                'minimum_order_for_delivery',
                'custom_schedule_json', // ✅
                'is_24_hours',          // ✅
                'visibility',           // ✅
                'account_status',       // ✅
            ])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Restaurant with ID {$this->id} was {$eventName}");
    }

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'restaurant_category_id',
        'description',
        'logo',
        'banner_image',
        'address',
        'latitude',
        'longitude',
        'phone_number',
        'status',
        'rating',
        'service_type',
        'minimum_order_for_delivery',
        'custom_schedule_json', // ✅ new
        'is_24_hours',          // ✅ new
        'visibility',           // ✅ new
        'account_status',       // ✅ new
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($restaurant) {
            // ✅ Unique Slug generation with fallback
            $slug = Str::slug($restaurant->name);
            $existingSlugCount = Restaurant::where('slug', $slug)->count();

            // If the slug already exists, append a unique ID
            if ($existingSlugCount > 0) {
                $slug = $slug . '-' . uniqid();
            }

            $restaurant->slug = $slug; // ✅ Save unique slug
        });
    }
    protected $casts = [
        'custom_schedule_json' => 'array',
        'is_24_hours' => 'boolean',
        'visibility' => 'boolean',
        'rating' => 'float',
        'minimum_order_for_delivery' => 'float',
    ];

    /**
     * Get the owner of the restaurant.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
    /**
     * Get the category of the restaurant.
     */
    public function category()
    {
        return $this->belongsTo(RestaurantCategory::class, 'restaurant_category_id');
    }
    /**
     * Get all reviews for the restaurant.
     */
    public function menus()
    {
        return $this->hasMany(Menu::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
    /**
     * Get all orders for the restaurant.
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
    /**
     * Scope search for restaurants using full-text search.
     */
    public function scopeSearch($query, $searchTerm)
    {
        return $query->whereFullText(['name', 'description', 'address'], $searchTerm);
    }

    public function scopeVisibleActive($query)
    {
        return $query->where('visibility', true)->where('account_status', 'active');
    }
    public function checkAndUpdateStatusBasedOnSchedule()
    {
        // Skip check for 24-hour restaurants
        if ($this->is_24_hours) {
            if ($this->status !== 'open') {
                $this->update(['status' => 'open']);
            }
            return;
        }

        $now = now();
        $day = $now->format('l'); // e.g., Monday

        $schedule = $this->custom_schedule_json[$day] ?? null;

        if (!$schedule || !$schedule['enabled']) {
            if ($this->status !== 'closed') {
                $this->update(['status' => 'closed']);
            }
            return;
        }

        $start = \Carbon\Carbon::createFromFormat('H:i', $schedule['open']);
        $end = \Carbon\Carbon::createFromFormat('H:i', $schedule['close']);

        // Adjust dates to today
        $start->setDate($now->year, $now->month, $now->day);
        $end->setDate($now->year, $now->month, $now->day);

        if ($now->between($start, $end)) {
            if ($this->status !== 'open') {
                $this->update(['status' => 'open']);
            }
        } else {
            if ($this->status !== 'closed') {
                $this->update(['status' => 'closed']);
            }
        }
    }
}
