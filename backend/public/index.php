<?php

/**
 * Router for PHP Built-in Development Server
 */

error_log("Router called for: " . $_SERVER['REQUEST_URI']);

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// List of real files/directories to serve directly
$realFile = __DIR__ . $requestPath;

if ($requestPath !== '/' && file_exists($realFile) && is_file($realFile)) {
    error_log("Serving real file: $realFile");
    return false; // Let the server serve it
}

error_log("Routing to _app.php");

// Route everything else through _app.php
require __DIR__ . '/_app.php';
