<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->enum('type', ['discount', 'shipping', 'reward', 'other'])->default('discount')->after('id');
        });
    }

    public function down()
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
