<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate([
            'email' => 'admin@example.com',
        ], [
            'name' => 'Admin User',
            'password' => Hash::make('password'),
            'phone_number' => '09120000001',
            'role' => 'admin'
        ]);

        User::firstOrCreate([
            'email' => 'owner@example.com',
        ], [
            'name' => 'Restaurant Owner',
            'password' => Hash::make('password'),
            'phone_number' => '09120000002',
            'role' => 'restaurant_owner'
        ]);

        User::firstOrCreate([
            'email' => 'customer@example.com',
        ], [
            'name' => 'Customer User',
            'password' => Hash::make('password'),
            'phone_number' => '09120000003',
            'role' => 'customer'
        ]);

        User::firstOrCreate([
            'email' => 'rider@example.com',
        ], [
            'name' => 'Delivery Rider',
            'password' => Hash::make('password'),
            'phone_number' => '09120000004',
            'role' => 'rider'
        ]);
    }
}
