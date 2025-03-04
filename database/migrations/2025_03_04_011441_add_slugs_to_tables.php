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
        Schema::table('restaurants', function (Blueprint $table) {
            // ✅ Add slugs where needed
            Schema::table('restaurants', function (Blueprint $table) {
                $table->string('slug')->unique()->after('name'); // ✅ SEO-friendly URL
            });
            Schema::table('restaurant_categories', function (Blueprint $table) {
                $table->string('slug')->unique()->after('name'); // ✅ Add slug column
            });

            Schema::table('menus', function (Blueprint $table) {
                $table->string('slug')->unique()->after('name');
            });
            Schema::table('menu_categories', function (Blueprint $table) {
                $table->string('slug')->unique()->after('name'); // ✅ Add slug column
            });
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
        Schema::table('restaurant_categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });


        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
        Schema::table('menu_categories', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
