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
        Schema::table('refunds', function (Blueprint $table) {
            $table->string('image_proof')->nullable()->after('reason'); // ✅ Stores image proof of the issue
            $table->enum('admin_status', ['pending', 'approved', 'denied'])->default('pending')->after('status'); // ✅ Tracks admin review status
            $table->text('admin_response')->nullable()->after('admin_status'); // ✅ Admin response (if denied)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->dropColumn(['image_proof', 'admin_status', 'admin_response']);
        });
    }
};
