<?php

namespace App\Helpers;

class Response
{
    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): void
    {
        http_response_code($statusCode);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ]);
        exit;
    }

    public static function error(string $message = 'Error', mixed $errors = null, int $statusCode = 400): void
    {
        http_response_code($statusCode);

        // Log error to file for debugging
        $logDir = dirname(__DIR__, 2) . '/logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        $logMessage = date('Y-m-d H:i:s') . " - [$statusCode] $message\n";
        if ($errors) {
            $logMessage .= "Errors: " . json_encode($errors) . "\n";
        }
        file_put_contents($logDir . '/error.log', $logMessage, FILE_APPEND);

        echo json_encode([
            'success' => false,
            'error' => $message,
            'message' => $message,
            'errors' => $errors,
        ]);
        exit;
    }

    public static function setJsonHeader(): void
    {
        header('Content-Type: application/json; charset=utf-8');
    }

    public static function setCorsHeaders(string $origin = '*'): void
    {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, x-admin-secret');
        header('Access-Control-Max-Age: 3600');
    }
}
