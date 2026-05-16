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
        Schema::create('enseigner', function (Blueprint $table) {
            $table->foreignId('idPersonnel')
                  ->constrained('personnels', 'idPersonnel')
                  ->cascadeOnDelete();

            $table->foreignId('idSpecialite')
                  ->constrained('specialites', 'idSpecialite')
                  ->cascadeOnDelete();

            $table->primary(['idPersonnel', 'idSpecialite']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enseigner');
    }
};
