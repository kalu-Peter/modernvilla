<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;

class AdminController
{
    public function login(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $username = $body['username'] ?? null;
            $password = $body['password'] ?? null;

            if (!$username || !$password) {
                Response::error('Username and password are required', null, 400);
                return;
            }

            try {
                $pdo = Connection::getInstance();
                $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admin_users WHERE LOWER(username) = LOWER(?)');
                $stmt->execute([$username]);
                $user = $stmt->fetch(\PDO::FETCH_ASSOC);

                if (!$user) {
                    Response::error('Invalid credentials', null, 401);
                    return;
                }

                // Verify password using bcrypt
                if (!password_verify($password, $user['password_hash'])) {
                    Response::error('Invalid credentials', null, 401);
                    return;
                }

                // Generate a session token or return admin secret
                $adminSecret = getenv('ADMIN_SECRET') ?: 'dev-secret-key';

                Response::success([
                    'secret' => $adminSecret,
                    'username' => $user['username']
                ], 'Login successful');
            } catch (\Exception $e) {
                Response::error('Server error', [$e->getMessage()], 500);
            }
        } else {
            Response::error('Method not allowed', null, 405);
        }
    }
}
