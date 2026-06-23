<?php

/**
 * Test Admin Login - Direct Database Query
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

echo "=== Testing Admin Login ===\n\n";

// Direct connection
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
    ]);

    $username = 'admin';
    $password_to_check = 'admin123';

    echo "Testing login with:\n";
    echo "  Username: $username\n";
    echo "  Password: $password_to_check\n\n";

    echo "[1/3] Fetching admin user from database...\n";
    $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        echo "❌ User not found!\n";
        exit(1);
    }

    echo "✅ User found: {$user['username']}\n";
    echo "  ID: {$user['id']}\n";
    echo "  Password hash: {$user['password_hash']}\n\n";

    echo "[2/3] Verifying password...\n";
    $verified = password_verify($password_to_check, $user['password_hash']);

    if (!$verified) {
        echo "❌ Password verification FAILED!\n";
        echo "   This is why you're getting a 500 error in the API!\n\n";
        echo "Solution: Reset the admin password\n";
        exit(1);
    }

    echo "✅ Password verified correctly!\n\n";

    echo "[3/3] Generating session token...\n";
    $token = bin2hex(random_bytes(32));
    echo "✅ Token generated: " . substr($token, 0, 20) . "...\n\n";

    echo "✅ ALL TESTS PASSED!\n";
    echo "\nYour admin login should work now.\n";
    echo "Try logging in with:\n";
    echo "  Username: admin\n";
    echo "  Password: admin123\n";
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    exit(1);
}
