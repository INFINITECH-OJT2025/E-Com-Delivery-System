<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'favoritable_type', 'favoritable_id'];

    public function favoritable()
    {
        return $this->morphTo();
    }
}
