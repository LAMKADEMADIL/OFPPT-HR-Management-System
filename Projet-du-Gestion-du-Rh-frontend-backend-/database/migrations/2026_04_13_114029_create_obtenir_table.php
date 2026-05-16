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
        Schema::create('obtenir', function (Blueprint $table) {
            $table->foreignId('idPersonnel')
                  ->constrained('personnels', 'idPersonnel')
                  ->cascadeOnDelete();

            $table->foreignId('idDiplome')
                  ->constrained('diplomes', 'idDiplome')
                  ->cascadeOnDelete();

            $table->primary(['idPersonnel', 'idDiplome']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('obtenir');
    }
};
