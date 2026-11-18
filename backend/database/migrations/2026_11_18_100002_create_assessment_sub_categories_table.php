<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_sub_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('assessment_categories')->cascadeOnDelete();
            $table->string('code', 30);
            $table->string('name');                            // Regulation of Own Emotions
            $table->string('name_ta')->nullable();
            $table->text('description')->nullable();
            $table->smallInteger('min_score')->nullable();     // possible range of this sub category
            $table->smallInteger('max_score')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['category_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_sub_categories');
    }
};
