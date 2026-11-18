<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_categories', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();              // BEIS10, MHI38 ...
            $table->string('title');                           // Brief Emotional Intelligence Scale (BEIS-10)
            $table->string('title_ta')->nullable();
            $table->string('domain', 80)->nullable();          // Emotional Intelligence (grouping label)
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->text('instructions_ta')->nullable();
            $table->string('total_mode', 10)->default('sum');  // sum | none
            $table->smallInteger('min_score')->nullable();     // lowest / highest possible total
            $table->smallInteger('max_score')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_categories');
    }
};
