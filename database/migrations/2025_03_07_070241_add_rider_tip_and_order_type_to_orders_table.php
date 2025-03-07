<?php

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('rider_tip', 10, 2)->default(0)->after('total_price'); // ✅ Rider tip, default 0
            $table->enum('order_type', ['delivery', 'pickup'])->default('delivery')->after('restaurant_id'); // ✅ Delivery or Pickup
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['rider_tip', 'order_type']);
        });
    }
};
