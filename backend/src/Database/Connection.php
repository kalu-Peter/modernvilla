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
        // 127.0.0.1 (not "localhost") forces a TCP connection — "localhost"
        // makes most MySQL clients try a Unix socket file instead, which on
        // some shared hosts isn't where PHP expects it and fails with
        // SQLSTATE[HY000] [2002] No such file or directory.
        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $port = $_ENV['DB_PORT'] ?? '3306';
        $dbname = $_ENV['DB_NAME'] ?? 'shelter';
        $user = $_ENV['DB_USER'] ?? 'root';
        $password = $_ENV['DB_PASSWORD'] ?? '';

        $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";

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
