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
        Schema::create('search_keywords', function (Blueprint $table) {
            $table->id();
            $table->string('keyword')->unique();
            $table->integer('search_count')->default(1); // Track search trends
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('search_keywords');
    }
};
