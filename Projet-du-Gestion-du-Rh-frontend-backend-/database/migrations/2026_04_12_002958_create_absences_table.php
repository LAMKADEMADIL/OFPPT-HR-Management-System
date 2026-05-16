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
        Schema::create('absences', function (Blueprint $table) {
           $table->id('idAbsence');
           $table->date('date_absence');
           $table->string('motif')->nullable();

           $table->foreignId('idPersonnel')
                 ->constrained('personnels', 'idPersonnel')
                 ->onDelete('cascade');

           $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};
