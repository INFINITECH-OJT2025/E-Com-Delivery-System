<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->foreignId('delivery_rider_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('customer_address_id')->nullable()->constrained('customer_addresses')->onDelete('set null'); // ✅ Added column

            $table->decimal('total_price', 10, 2);
            $table->enum('order_status', ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'canceled'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->dateTime('scheduled_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
