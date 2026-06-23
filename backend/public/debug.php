<?php

/**
 * Debug route test - check if routing is working
 */

// Load environment
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

// Simple autoloader
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $path = dirname(__DIR__) . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (file_exists($path)) {
            require $path;
        }
    }
});

use App\Helpers\Request;

header('Content-Type: application/json');

// Initialize request
Request::init();

$method = Request::getMethod();
$path = Request::getPath();
$body = Request::getBody();

echo json_encode([
    'debug' => true,
    'request' => [
        'method' => $method,
        'path' => $path,
        'body' => $body,
        'full_uri' => $_SERVER['REQUEST_URI'],
        'parsed_url' => parse_url($_SERVER['REQUEST_URI']),
    ],
    'routes_file' => file_exists(dirname(__DIR__) . '/routes.php') ? 'EXISTS' : 'NOT FOUND',
    'routes' => include dirname(__DIR__) . '/routes.php',
], JSON_PRETTY_PRINT);
