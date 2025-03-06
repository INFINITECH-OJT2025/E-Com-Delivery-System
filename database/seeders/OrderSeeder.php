<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Restaurant;
use App\Models\CustomerAddress;
use App\Models\Menu;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure a customer exists
        $customer = User::where('role', 'customer')->first();
        if (!$customer) {
            $customer = User::create([
                'name' => 'Test Customer',
                'email' => 'customer@example.com',
                'password' => bcrypt('password'),
                'phone_number' => '09987654321',
                'role' => 'customer',
            ]);
        }

        // Ensure a customer address exists
        $customerAddress = CustomerAddress::firstOrCreate([
            'user_id' => $customer->id,
        ], [
            'label' => 'Home',
            'address' => '123 Customer St, City',
            'latitude' => 14.5900,
            'longitude' => 120.9800,
            'is_default' => true,
        ]);

        // Ensure a restaurant exists
        $restaurant = Restaurant::first();
        if (!$restaurant) {
            $restaurant = Restaurant::create([
                'owner_id' => 2, // Assuming a restaurant owner exists
                'name' => 'Test Restaurant',
                'slug' => 'test-restaurant-' . uniqid(),
                'restaurant_category_id' => 1,
                'description' => 'Sample restaurant for testing orders',
                'logo' => 'restaurant_logo.png',
                'banner_image' => 'restaurant_banner.jpg',
                'address' => '456 Restaurant Ave, City',
                'latitude' => 14.5995,
                'longitude' => 120.9842,
                'phone_number' => '09123456789',
                'status' => 'open',
                'rating' => 4.5,
                'service_type' => 'both',
            ]);
        }

        // Ensure menus exist
        $menu1 = Menu::firstOrCreate([
            'restaurant_id' => $restaurant->id,
            'name' => 'Cheeseburger'
        ], [
            'slug' => 'cheeseburger-' . uniqid(),
            'menu_category_id' => 1,
            'description' => 'A delicious cheeseburger with 100% beef patty.',
            'price' => 120.00,
            'image' => 'cheeseburger.jpg',
            'availability' => 'in_stock'
        ]);

        $menu2 = Menu::firstOrCreate([
            'restaurant_id' => $restaurant->id,
            'name' => 'Pepperoni Pizza'
        ], [
            'slug' => 'pepperoni-pizza-' . uniqid(),
            'menu_category_id' => 2,
            'description' => 'Classic pepperoni pizza with mozzarella cheese.',
            'price' => 350.00,
            'image' => 'pepperoni_pizza.jpg',
            'availability' => 'in_stock'
        ]);

        // Ensure a delivery rider exists
        $rider = User::where('role', 'rider')->first();
        if (!$rider) {
            $rider = User::create([
                'name' => 'Test Rider',
                'email' => 'rider@example.com',
                'password' => bcrypt('password'),
                'phone_number' => '09876543210',
                'role' => 'rider',
            ]);
        }

        // Create an order
        $order = Order::create([
            'customer_id' => $customer->id,
            'restaurant_id' => $restaurant->id,
            'delivery_rider_id' => $rider->id,
            'customer_address_id' => $customerAddress->id, // ✅ Ensure address is set
            'total_price' => 590.00,
            'order_status' => 'completed',
            'payment_status' => 'paid',
            'scheduled_time' => now()->addHours(2),
        ]);

        // Add items to the order
        OrderItem::create([
            'order_id' => $order->id,
            'menu_id' => $menu1->id,
            'quantity' => 2,
            'price' => 120.00,
            'subtotal' => 240.00
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'menu_id' => $menu2->id,
            'quantity' => 1,
            'price' => 350.00,
            'subtotal' => 350.00
        ]);
    }
}
