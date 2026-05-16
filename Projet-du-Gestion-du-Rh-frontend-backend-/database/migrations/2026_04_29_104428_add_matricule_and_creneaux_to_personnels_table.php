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
        Schema::table('personnels', function (Blueprint $table) {
            $table->string('matricule')->nullable()->unique()->after('idPersonnel');
            $table->string('nom_prenom')->nullable()->after('prenom');
            $table->json('creneaux')->nullable()->after('nom_prenom');
            $table->string('type')->nullable()->after('type_personnel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personnels', function (Blueprint $table) {
            $table->dropColumn(['matricule', 'nom_prenom', 'creneaux', 'type']);
        });
    }
};
