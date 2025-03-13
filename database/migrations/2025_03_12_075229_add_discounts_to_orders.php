<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->after('total_price');
            $table->decimal('discount_on_subtotal', 10, 2)->default(0.00)->after('subtotal');
            $table->decimal('discount_on_shipping', 10, 2)->default(0.00)->after('discount_on_subtotal');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'discount_on_subtotal', 'discount_on_shipping']);
        });
    }
};
