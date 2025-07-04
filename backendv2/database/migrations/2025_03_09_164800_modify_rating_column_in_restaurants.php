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
        Schema::table('restaurants', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->nullable()->change(); // ✅ Allow NULL ratings
        });
    }

    public function down()
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->default(0.0)->change();
        });
    }
};
