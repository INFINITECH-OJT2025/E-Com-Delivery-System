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
            $table->fullText(['name', 'description', 'address']);
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->fullText(['name', 'description']);
        });
    }

    public function down()
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropFullText(['name', 'description', 'address']);
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->dropFullText(['name', 'description']);
        });
    }
};
