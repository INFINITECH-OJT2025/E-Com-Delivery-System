<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('remittances', function (Blueprint $table) {
            $table->decimal('expected_amount', 10, 2)->nullable()->after('amount');
            $table->boolean('is_short')->default(false)->after('expected_amount');
            $table->enum('status', ['pending', 'completed', 'short', 'disputed', 'approved', 'rejected'])->default('pending')->after('remit_date');
            $table->text('short_reason')->nullable()->after('notes');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('short_reason');
        });
    }

    public function down(): void
    {
        Schema::table('remittances', function (Blueprint $table) {
            $table->dropColumn([
                'expected_amount',
                'is_short',
                'status',
                'short_reason',
                'approved_by',
            ]);
        });
    }
};
