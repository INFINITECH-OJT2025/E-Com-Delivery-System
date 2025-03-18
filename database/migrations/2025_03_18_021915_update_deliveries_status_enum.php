<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('deliveries', function (Blueprint $table) {
            // ✅ Modify status to include all rider-specific order tracking steps
            $table->enum('status', [
                'assigned',
                'arrived_at_vendor',
                'picked_up',
                'in_delivery',
                'arrived_at_customer',
                'photo_uploaded',
                'delivered'
            ])->default('assigned')->change();
        });
    }

    public function down()
    {
        Schema::table('deliveries', function (Blueprint $table) {
            // ✅ Revert to the previous status options if needed
            $table->enum('status', ['assigned', 'picked_up', 'in_transit', 'delivered'])->default('assigned')->change();
        });
    }
};
