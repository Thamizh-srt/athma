<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('assessment_categories')->cascadeOnDelete();
            // nullable: some scales (e.g. GDS-15) have no sub categories
            $table->foreignId('sub_category_id')->nullable()->constrained('assessment_sub_categories')->nullOnDelete();
            $table->unsignedSmallInteger('number');            // display order inside the category
            $table->text('text');
            $table->text('text_ta')->nullable();
            $table->string('type', 20)->default('choice');  
            $table->string('scale_type', 20)->nullable(); 
            $table->timestamps();

            $table->unique(['category_id', 'number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_questions');
    }
};
