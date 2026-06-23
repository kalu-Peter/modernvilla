<?php

/**
 * Test Admin Login Endpoint
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

// Load autoloader
spl_autoload_register(function ($class) {
    if (strpos($class, 'App\\') === 0) {
        $path = dirname(__DIR__) . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (file_exists($path)) {
            require $path;
        }
    }
});

use App\Database\Connection;

// Test login
$username = 'admin';
$password = 'admin123';

echo "Testing login with:\n";
echo "  Username: $username\n";
echo "  Password: $password\n\n";

try {
    $pdo = Connection::getInstance();

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
    $verified = password_verify($password, $user['password_hash']);

    if (!$verified) {
        echo "❌ Password verification failed!\n";
        echo "\nTroubleshooting:\n";
        echo "1. Password hash may be corrupted\n";
        echo "2. Password in database may be wrong\n";
        echo "3. Try resetting with: php reset-admin.php\n";
        exit(1);
    }

    echo "✅ Password verified!\n\n";

    echo "[3/3] Generating token...\n";
    $token = bin2hex(random_bytes(32));
    echo "✅ Token generated: " . substr($token, 0, 16) . "...\n\n";

    echo "✅ Login test successful!\n";
    echo "\nResponse would be:\n";
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'secret' => $token
        ]
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
