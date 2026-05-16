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
            $table->string('cin')->nullable()->change();
            $table->string('nom')->nullable()->change();
            $table->string('prenom')->nullable()->change();
            $table->enum('type_personnel', ['formateur', 'administratif'])->nullable()->change();
            $table->enum('statut', ['permanent', 'vacataire'])->nullable()->change();
            $table->unsignedBigInteger('idEtab')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personnels', function (Blueprint $table) {
            $table->string('cin')->nullable(false)->change();
            $table->string('nom')->nullable(false)->change();
            $table->string('prenom')->nullable(false)->change();
            $table->enum('type_personnel', ['formateur', 'administratif'])->nullable(false)->change();
            $table->enum('statut', ['permanent', 'vacataire'])->nullable(false)->change();
            $table->unsignedBigInteger('idEtab')->nullable(false)->change();
        });
    }
};
