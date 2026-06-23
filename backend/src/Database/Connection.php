<?php

namespace App\Database;

use PDO;
use PDOException;

class Connection
{
    private static ?PDO $connection = null;

    public static function getInstance(): PDO
    {
        if (self::$connection === null) {
            self::$connection = self::connect();
        }
        return self::$connection;
    }

    private static function connect(): PDO
    {
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $port = $_ENV['DB_PORT'] ?? '5054';
        $dbname = $_ENV['DB_NAME'] ?? 'shelter';
        $user = $_ENV['DB_USER'] ?? 'postgres';
        $password = $_ENV['DB_PASSWORD'] ?? '';

        $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

        try {
            $pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            return $pdo;
        } catch (PDOException $e) {
            // Log connection error details
            $logDir = dirname(__DIR__, 2) . '/logs';
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
            $logMessage = date('Y-m-d H:i:s') . " - Database Connection Error\n";
            $logMessage .= "DSN: $dsn\n";
            $logMessage .= "User: $user\n";
            $logMessage .= "Error: " . $e->getMessage() . "\n\n";
            file_put_contents($logDir . '/error.log', $logMessage, FILE_APPEND);

            die(json_encode([
                'success' => false,
                'message' => 'Database connection failed',
                'errors' => [$e->getMessage()]
            ]));
        }
    }

    public static function close(): void
    {
        self::$connection = null;
    }
}
