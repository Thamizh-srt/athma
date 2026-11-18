<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('assessment_questions')->cascadeOnDelete();
            $table->string('label');
            $table->string('label_ta')->nullable();
            $table->smallInteger('value');                     // number printed on the form (1-6, 0-2 ...)
            $table->smallInteger('score');                     // points awarded (already reverse-scored where needed)
            $table->boolean('is_flagged')->default(false);     // answer that should alert a clinician
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['question_id', 'value']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_options');
    }
};
