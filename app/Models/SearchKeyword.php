<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SearchKeyword extends Model
{
    use HasFactory;

    protected $fillable = [
        'keyword',
        'search_count'
    ];

    /**
     * Increment search count for a keyword.
     */
    public static function incrementSearchCount($keyword)
    {
        return static::updateOrCreate(
            ['keyword' => $keyword],
            ['search_count' => DB::raw('search_count + 1')]
        );
    }
}
