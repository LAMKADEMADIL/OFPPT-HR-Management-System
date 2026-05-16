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
        Schema::table('seances', function (Blueprint $table) {
            // Relation with personnel
            $table->foreignId('idPersonnel')->nullable()->after('id')->constrained('personnels', 'idPersonnel')->onDelete('cascade');
            
            // Timetable fields (Weekly)
            $table->integer('jour')->nullable()->after('matricule'); // 1-7
            $table->time('heure_debut')->nullable()->after('jour');
            $table->time('heure_fin')->nullable()->after('heure_debut');
            $table->string('module')->nullable()->after('heure_fin');
            $table->string('salle')->nullable()->after('module');
            $table->string('groupe')->nullable()->after('salle');
            $table->string('etablissement')->nullable()->after('groupe');
            
            // Generic date for monthly view / planning
            $table->date('date')->nullable()->after('etablissement');
            
            // Make old fields nullable or keep them for backward compatibility
            $table->string('matricule')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('seances', function (Blueprint $table) {
            $table->dropForeign(['idPersonnel']);
            $table->dropColumn(['idPersonnel', 'jour', 'heure_debut', 'heure_fin', 'module', 'salle', 'groupe', 'etablissement', 'date']);
        });
    }
};
