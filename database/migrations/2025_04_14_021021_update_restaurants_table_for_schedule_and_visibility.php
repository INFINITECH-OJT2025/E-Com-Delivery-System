<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            // Remove old fields
            $table->dropColumn(['opening_time', 'closing_time']);

            // Add new fields
            $table->json('custom_schedule_json')->nullable()->after('minimum_order_for_delivery');
            $table->boolean('is_24_hours')->default(false)->after('custom_schedule_json');
            $table->boolean('visibility')->default(false)->after('is_24_hours');
            $table->enum('account_status', ['pending', 'active', 'banned'])->default('pending')->after('status');
        });

        // Set default schedule JSON for all existing restaurants
        DB::table('restaurants')->update([
            'custom_schedule_json' => json_encode([
                "Monday"    => ["enabled" => true, "open" => "06:00", "close" => "23:00"],
                "Tuesday"   => ["enabled" => true, "open" => "06:00", "close" => "23:00"],
                "Wednesday" => ["enabled" => true, "open" => "06:00", "close" => "23:00"],
                "Thursday"  => ["enabled" => true, "open" => "06:00", "close" => "23:00"],
                "Friday"    => ["enabled" => true, "open" => "06:00", "close" => "23:00"],
                "Saturday"  => ["enabled" => true, "open" => "06:00", "close" => "23:00"],
                "Sunday"    => ["enabled" => true, "open" => "06:00", "close" => "23:00"],
            ]),
        ]);
    }

    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            // Restore old time-based fields
            $table->time('opening_time')->nullable()->after('service_type');
            $table->time('closing_time')->nullable()->after('opening_time');

            // Drop the new fields
            $table->dropColumn(['custom_schedule_json', 'is_24_hours', 'visibility', 'account_status']);
        });
    }
};
