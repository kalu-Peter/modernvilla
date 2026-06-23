<?php

/**
 * Database Connection Test Script
 */

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

echo "=== Database Connection Test ===\n\n";

// Display environment variables
$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '5054';
$dbname = $_ENV['DB_NAME'] ?? 'shelter';
$user = $_ENV['DB_USER'] ?? 'postgres';
$password = $_ENV['DB_PASSWORD'] ?? '';

echo "Testing connection with:\n";
echo "  Host: $host\n";
echo "  Port: $port\n";
echo "  Database: $dbname\n";
echo "  User: $user\n";
echo "\n";

$dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

try {
    echo "[1/4] Attempting to connect to PostgreSQL...\n";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo "✅ Connection successful!\n\n";

    echo "[2/4] Checking tables...\n";
    $tables = [
        'properties',
        'pricing',
        'reservations',
        'blocked_dates',
        'seasonal_pricing',
        'admin_users'
    ];

    $stmt = $pdo->query("
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    ");
    $existingTables = array_column($stmt->fetchAll(), 'table_name');

    foreach ($tables as $table) {
        $exists = in_array($table, $existingTables) ? '✅' : '❌';
        echo "  $exists $table\n";
    }
    echo "\n";

    echo "[3/4] Checking admin_users table...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM admin_users");
    $result = $stmt->fetch();
    echo "  Admin users count: {$result['count']}\n\n";

    echo "[4/4] Testing sample query...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM properties");
    $result = $stmt->fetch();
    echo "  Properties count: {$result['count']}\n";
    if ($result['count'] > 0) {
        $stmt = $pdo->query("SELECT name FROM properties LIMIT 1");
        $prop = $stmt->fetch();
        echo "  Sample property: {$prop['name']}\n";
    }
    echo "\n";

    echo "✅ All tests passed! Database is connected and ready.\n";
} catch (PDOException $e) {
    echo "❌ Connection failed!\n\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    echo "Troubleshooting:\n";
    echo "1. Is PostgreSQL running on $host:$port?\n";
    echo "2. Does database '$dbname' exist?\n";
    echo "3. Are username/password correct?\n";
    echo "4. Check .env file for typos\n";
    exit(1);
}
