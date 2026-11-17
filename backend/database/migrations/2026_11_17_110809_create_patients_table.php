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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 100);
            $table->unsignedTinyInteger('age')->nullable();
            $table->string('gender', 30)->nullable();
            $table->string('phone', 10)->index();
            $table->string('email')->unique();
            $table->string('address', 255);
            $table->string('city', 60);
            $table->string('state', 60);
            $table->string('pincode', 6);
            $table->string('location', 80);
            $table->string('marital_status', 30)->nullable();
            $table->string('education', 100)->nullable();
            $table->string('occupation', 100)->nullable();
            $table->string('referred_by', 100)->nullable();
            $table->string('password');
            $table->boolean('consent')->default(false);
            $table->timestamp('consented_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
