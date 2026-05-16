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
        Schema::create('users', function (Blueprint $table) {
           
           $table->id();//iduser
           $table->string('username')->unique();
           $table->string('email');
           $table->string('password');
           $table->enum('Role', ['directeur du complexe', 'gestionnaire CFMR']);

           $table->foreignId('idPersonnel')
                 ->unique()
                 ->nullable()
                 ->constrained('personnels', 'idPersonnel')
                 ->nullOnDelete();

           $table->timestamps();
      });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
