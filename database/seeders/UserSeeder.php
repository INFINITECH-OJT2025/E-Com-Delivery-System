<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '09123456789',
            'role' => 'admin'
        ]);

        User::create([
            'name' => 'Restaurant Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '09123456789',
            'role' => 'restaurant_owner'
        ]);

        User::create([
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '09123456789',
            'role' => 'customer'
        ]);

        User::create([
            'name' => 'Delivery Rider',
            'email' => 'rider@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '09123456789',
            'role' => 'rider'
        ]);
    }
}
