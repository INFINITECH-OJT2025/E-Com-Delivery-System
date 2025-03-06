<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cart;
use App\Models\CartItem;

class CartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cart = Cart::create([
            'user_id' => 3, // Assuming the customer is user ID 3
            'restaurant_id' => 1
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'menu_id' => 1,
            'quantity' => 2,
            'price' => 120.00,
            'subtotal' => 240.00
        ]);

        CartItem::create([
            'cart_id' => $cart->id,
            'menu_id' => 2,
            'quantity' => 1,
            'price' => 350.00,
            'subtotal' => 350.00
        ]);
    }
}
