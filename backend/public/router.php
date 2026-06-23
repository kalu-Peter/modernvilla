<?php
// Router for PHP built-in development server
// This file routes all requests to index.php for proper URL rewriting

$requested_file = $_SERVER['DOCUMENT_ROOT'] . $_SERVER['REQUEST_URI'];

// If the requested file is a real file or directory, serve it
if (is_file($requested_file) || is_dir($requested_file)) {
    return false; // Let the server handle it
}

// Otherwise, route everything through index.php
require $_SERVER['DOCUMENT_ROOT'] . '/index.php';
exit;
