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
        Schema::table('users', function (Blueprint $table) {
            $table->string('rider_id')->nullable()->unique()->after('role'); // Unique ID for riders
            $table->string('vehicle_type')->nullable()->after('rider_id'); // e.g., motorcycle, bicycle, car
            $table->string('profile_image')->nullable()->after('vehicle_type');
            $table->string('plate_number')->nullable()->after('profile_image'); // Vehicle plate number
            $table->enum('rider_status', ['pending', 'approved', 'banned'])->default('pending')->after('plate_number'); // Approval status
            $table->string('license_image')->nullable()->after('profile_image');
            $table->decimal('lat', 10, 7)->nullable()->after('rider_status'); // Rider location
            $table->decimal('lng', 10, 7)->nullable()->after('lat'); // Rider location
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rider_id', 'vehicle_type', 'profile_image', 'plate_number', 'rider_status', 'lat', 'lng']);
        });
    }
};
