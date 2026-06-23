<?php

/**
 * Simple autoloader for the App namespace
 */

spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $path = dirname(__DIR__) . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (file_exists($path)) {
            require $path;
        }
    }
});
