<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_score_bands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('assessment_categories')->cascadeOnDelete();
            // null = band for the category TOTAL, otherwise for that sub category
            $table->foreignId('sub_category_id')->nullable()->constrained('assessment_sub_categories')->cascadeOnDelete();
            $table->smallInteger('min_score');
            $table->smallInteger('max_score');
            $table->string('label', 80);                       // Low / Normal / High / Mild autism ...
            $table->string('level', 20);                       // very_low|low|normal|moderate|high|very_high
            $table->text('interpretation')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['category_id', 'sub_category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_score_bands');
    }
};
