<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Menu extends Model
{
    use HasFactory, LogsActivity;
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['restaurant_id', 'menu_category_id', 'name', 'slug', 'description', 'price', 'availability', 'stock'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Menu item {$this->name} was {$eventName}");
    }

    protected $fillable = [
        'restaurant_id',
        'menu_category_id',
        'name',
        'slug',
        'description',
        'price',
        'image',
        'availability',
        'stock' // ✅ Allow mass assignment for stock

    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($menu) {
            $menu->slug = Str::slug($menu->name) . "-" . uniqid();
        });
    }
    public function setStockAttribute($value)
    {
        $this->attributes['stock'] = $value;
        $this->attributes['availability'] = ($value > 0) ? 'in_stock' : 'out_of_stock';
    }
    public function restoreStock(int $quantity)
    {
        $this->increment('stock', $quantity);
    }
    /**
     * ✅ Deduct stock when an order is placed
     */
    public function deductStock(int $quantity)
    {
        if ($this->stock >= $quantity) {
            $this->decrement('stock', $quantity);
        } else {
            throw new \Exception("Insufficient stock for '{$this->name}'");
        }
    }
    /**
     * Get the restaurant that owns the menu item.
     */
    public function restaurant()
    {
        return $this->belongsTo(Restaurant::class);
    }
    /**
     * Get the category of the menu item.
     */
    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
    /**
     * Scope search for menu items using full-text search.
     */
    public function scopeSearch($query, $searchTerm)
    {
        return $query->whereFullText(['name', 'description'], $searchTerm);
    }
}
