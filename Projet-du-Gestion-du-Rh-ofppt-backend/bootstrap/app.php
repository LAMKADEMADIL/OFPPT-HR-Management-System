<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Auth\AuthenticationException;
//use Throwable;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        
         //cors
          $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

         // Roles
         $middleware->alias([
              'role' => RoleMiddleware::class,
         ]);

         // Disable redirect for unauthenticated API requests( API no redirect)
        $middleware->redirectGuestsTo(function () {
             return null; 
        });  

    })
    ->withExceptions(function (Exceptions $exceptions){
          //Authentication
         $exceptions->render(function (AuthenticationException $e, $request) {
           return response()->json([
              'status' => 'error',
              'message' => 'Unauthenticated'
           ], 401);
         });
         
         // Model not found
         $exceptions->render(function (ModelNotFoundException $e, $request) {
            return response()->json([
                'status' => 'error',
                'message' => 'Resource not found'
            ], 404);
         });

         // Validation error
         $exceptions->render(function (ValidationException $e, $request) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
         });

         // HTTP errors
         $exceptions->render(function (HttpException $e, $request) {
            return response()->json([
               'status' => 'error',
               'message' => $e->getMessage() ?: 'HTTP Error'
            ], $e->getStatusCode());
         });

         // Default error
         $exceptions->render(function (Throwable $e, $request) {

         if (config('app.debug')) {
            return response()->json([
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
         }

            return response()->json([
               'status' => 'error',
               'message' => 'Server Error'
            ], 500);
         });

         
        /* $exceptions->render(function (Throwable $e, $request) {
          return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
          ], 500);
         });*/
          
    })->create();
