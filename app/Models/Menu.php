<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Menu extends Model
{
    use HasFactory;

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
