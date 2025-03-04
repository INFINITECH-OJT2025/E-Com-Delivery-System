<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RestaurantCategory extends Model
{
    use HasFactory;

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
