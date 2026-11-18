<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_assessment_id')->constrained('patient_assessments')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('assessment_questions')->restrictOnDelete();
            $table->foreignId('option_id')->constrained('assessment_options')->restrictOnDelete();
            $table->smallInteger('score');                     // snapshot of the option score at answer time
            $table->timestamps();

            $table->unique(['patient_assessment_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_answers');
    }
};
