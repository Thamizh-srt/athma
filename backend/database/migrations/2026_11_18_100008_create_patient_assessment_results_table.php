<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_assessment_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_assessment_id')->constrained('patient_assessments')->cascadeOnDelete();
            // null = TOTAL score row, otherwise the sub category score
            $table->foreignId('sub_category_id')->nullable()->constrained('assessment_sub_categories')->restrictOnDelete();
            $table->smallInteger('score');
            $table->string('label', 80)->nullable();           // snapshot of the band at submit time
            $table->string('level', 20)->nullable();
            $table->text('interpretation')->nullable();
            $table->timestamps();

            $table->index(['patient_assessment_id', 'sub_category_id'], 'pa_results_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_assessment_results');
    }
};
