<?php

/**
 * API Entry Point
 * 
 * This is the main entry point for all API requests.
 * Routes requests to the appropriate controller based on path and method.
 */

// Error handling
ini_set('display_errors', 0);
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    $logDir = dirname(__DIR__) . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    $message = date('Y-m-d H:i:s') . " - PHP Error [$errno] $errstr in $errfile:$errline\n";
    file_put_contents($logDir . '/error.log', $message, FILE_APPEND);
    return true;
});

set_exception_handler(function ($exception) {
    $logDir = dirname(__DIR__) . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    $message = date('Y-m-d H:i:s') . " - Exception: " . $exception->getMessage() . "\n";
    $message .= $exception->getTraceAsString() . "\n\n";
    file_put_contents($logDir . '/error.log', $message, FILE_APPEND);

    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'errors' => [$exception->getMessage()]
    ]);
    exit;
});

// Load environment variables
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Simple autoloader for the App namespace
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $path = dirname(__DIR__) . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (file_exists($path)) {
            require $path;
        }
    }
});

use App\Config\Config;
use App\Helpers\Response;
use App\Helpers\Request;

// Initialize configuration and request
Config::load();
Request::init();

// Set response headers
Response::setJsonHeader();
Response::setCorsHeaders(Config::get('FRONTEND_URL', 'http://localhost:5173'));

// Handle OPTIONS requests
if (Request::getMethod() === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Load routes
$routes = require dirname(__DIR__) . '/routes.php';

// Get request path and method
$method = Request::getMethod();
$path = Request::getPath();

// Debug logging
$logDir = dirname(__DIR__) . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}
file_put_contents($logDir . '/debug.log', 
    date('Y-m-d H:i:s') . " - $method $path\n" .
    "Full URI: {$_SERVER['REQUEST_URI']}\n" .
    "Routes available: " . json_encode(array_keys($routes[$method] ?? [])) . "\n\n",
    FILE_APPEND
);

// Remove query string from path if present
$path = strtok($path, '?');

// Find matching route
$matchedRoute = null;
$pathParams = [];

if (isset($routes[$method])) {
    foreach ($routes[$method] as $routePath => $handler) {
        // Convert route pattern to regex
        $pattern = preg_replace('/:[a-zA-Z_][a-zA-Z0-9_]*/', '([a-zA-Z0-9_-]+)', $routePath);
        $pattern = str_replace('/', '\/', $pattern);
        $pattern = '/^' . $pattern . '$/';

        if (preg_match($pattern, $path, $matches)) {
            $matchedRoute = $handler;
            $pathParams = array_slice($matches, 1);
            break;
        }
    }
}

if (!$matchedRoute) {
    Response::error('Route not found', null, 404);
}

// Parse handler (Controller@method)
[$controller, $action] = explode('@', $matchedRoute);
$controllerClass = 'App\Controllers\\' . $controller;

if (!class_exists($controllerClass)) {
    Response::error('Controller not found', null, 500);
}

// Instantiate controller and call action
$controllerInstance = new $controllerClass();

if (!method_exists($controllerInstance, $action)) {
    Response::error('Action not found', null, 500);
}

// Call the action with path parameters
call_user_func_array([$controllerInstance, $action], $pathParams);
