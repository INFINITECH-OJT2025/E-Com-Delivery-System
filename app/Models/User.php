<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'role',
        'email_verified_at', // ✅ Added email verification field
        'otp_code',        // ✅ Added OTP field
        'otp_expires_at',  // ✅ Added OTP expiration field
        'rider_id',
        'vehicle_type',
        'profile_image',
        'plate_number',
        'status',
        'profile_image',
        'license_image',
        'lat',
        'lng',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code', // ✅ Hide OTP for security
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function addresses()
    {
        return $this->hasMany(CustomerAddress::class);
    }

    /**
     * Get the restaurants owned by the user.
     */
    public function restaurants()
    {
        return $this->hasMany(Restaurant::class, 'owner_id');
    }

    /**
     * ✅ Define relationship with orders
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'rider_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isRider(): bool
    {
        return $this->role === 'rider';
    }
}
