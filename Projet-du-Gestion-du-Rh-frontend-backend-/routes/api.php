<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PersonnelController;
use App\Http\Controllers\DiplomeController;
use App\Http\Controllers\SpecialiteController;
use App\Http\Controllers\CongeController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\EtablissementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ImportEmploiController;
use App\Http\Controllers\PlanningImportController;
use App\Http\Controllers\SeanceController;


// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
           ->middleware('throttle:10,1'); // Limit login attempts to 10 per minute
    
    Route::post('/register', [AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // User profile route
    Route::get('/profile', [ProfileController::class, 'me']);
         

    // controller → باقي الموارد → roles (directeur du complexe,gestionnaire CFMR)
    Route::middleware('role:directeur du complexe,gestionnaire CFMR')->group(function () {
    
        // Etablissements
        Route::apiResource('etablissements', EtablissementController::class);

        // Personnels
        Route::apiResource('personnels', PersonnelController::class);

        // Diplomes
        Route::apiResource('diplomes', DiplomeController::class);

        // Specialites
        Route::apiResource('specialites', SpecialiteController::class);

        // Conges
        Route::apiResource('conges', CongeController::class);

        // Absences
        Route::apiResource('absences', AbsenceController::class);

        // Users
        Route::apiResource('users', UserController::class);

        // Unified Seances / Timetable / Planning
        Route::apiResource('seances', SeanceController::class);
        Route::post('/seances/import', [SeanceController::class, 'import']);
        
        // Aliases for backward compatibility in frontend
        Route::post('/import-emploi', [SeanceController::class, 'import']);
        Route::post('/import-planning', [SeanceController::class, 'import']);

        // Dashboard
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    });
});