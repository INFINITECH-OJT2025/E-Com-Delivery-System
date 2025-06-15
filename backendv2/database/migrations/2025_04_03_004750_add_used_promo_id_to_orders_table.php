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
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('used_promo_id')->nullable()->after('discount_on_shipping');

            // Optional: Add foreign key constraint
            $table->foreign('used_promo_id')->references('id')->on('promos')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['used_promo_id']);
            $table->dropColumn('used_promo_id');
        });
    }
};
