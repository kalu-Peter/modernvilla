<?php

/**
 * Reset Admin Password
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

echo "=== Admin Password Reset ===\n\n";

$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '5054';
$dbname = $_ENV['DB_NAME'] ?? 'shelter';
$user = $_ENV['DB_USER'] ?? 'postgres';
$password = $_ENV['DB_PASSWORD'] ?? '';

$dsn = "pgsql:host=$host;port=$port;dbname=$dbname";

try {
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $newPassword = 'admin123';
    echo "Resetting admin password to: $newPassword\n\n";

    // Generate bcrypt hash
    $hash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 10]);
    echo "Generated hash: $hash\n\n";

    // Update database
    $stmt = $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?');
    $stmt->execute([$hash, 'admin']);

    echo "✅ Admin password reset successfully!\n\n";

    // Verify the new hash works
    if (password_verify($newPassword, $hash)) {
        echo "✅ Password verification test PASSED!\n";
        echo "You can now login with:\n";
        echo "  Username: admin\n";
        echo "  Password: admin123\n";
    } else {
        echo "❌ Password verification failed!\n";
    }
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
