<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('assessment_categories')->restrictOnDelete();
            $table->string('status', 15)->default('in_progress'); // in_progress | completed
            $table->string('language', 5)->default('en');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['patient_id', 'category_id']);        // one attempt per patient per assessment
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_assessments');
    }
};
