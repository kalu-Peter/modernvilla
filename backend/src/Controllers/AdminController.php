<?php

namespace App\Controllers;

use App\Config\Config;
use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Uuid;
use App\Middleware\AdminAuth;

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

                // Generate a session token or return admin secret. Must read
                // the same way AdminAuth::verify() does (Config::get, backed
                // by $_ENV) — getenv() doesn't see vars _app.php sets via
                // $_ENV directly, so it always missed the real .env value.
                $adminSecret = Config::get('ADMIN_SECRET', 'dev-secret-key');

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

    /**
     * GET/POST/DELETE /api/admin/users — manage admin accounts.
     */
    public function manageUsers(): void
    {
        if (!AdminAuth::verify()) {
            return;
        }

        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'GET') {
            $this->listUsers();
            return;
        }
        if ($method === 'POST') {
            $this->createUser();
            return;
        }
        if ($method === 'DELETE') {
            $this->deleteUser();
            return;
        }

        Response::error('Method not allowed', null, 405);
    }

    private function listUsers(): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->query('SELECT id, username, created_at FROM admin_users ORDER BY username');
            $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($users);
            exit;
        } catch (\Exception $e) {
            Response::error('Failed to fetch users', [$e->getMessage()], 500);
        }
    }

    private function createUser(): void
    {
        try {
            $body = json_decode(file_get_contents('php://input'), true) ?? [];
            $username = trim($body['username'] ?? '');
            $password = $body['password'] ?? '';

            if (!$username || !$password) {
                Response::error('Username and password are required', null, 400);
                return;
            }

            $pdo = Connection::getInstance();

            $stmt = $pdo->prepare('SELECT id FROM admin_users WHERE LOWER(username) = LOWER(?)');
            $stmt->execute([$username]);
            if ($stmt->fetch()) {
                Response::error('Username already exists', null, 409);
                return;
            }

            $id = Uuid::v4();
            $stmt = $pdo->prepare('INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)');
            $stmt->execute([$id, $username, password_hash($password, PASSWORD_BCRYPT)]);

            Response::success(['id' => $id, 'username' => $username], 'User created', 201);
        } catch (\Exception $e) {
            Response::error('Failed to create user', [$e->getMessage()], 500);
        }
    }

    private function deleteUser(): void
    {
        try {
            $username = $_GET['username'] ?? null;
            if (!$username) {
                Response::error('Username is required', null, 400);
                return;
            }

            $pdo = Connection::getInstance();

            // Never allow deleting the last remaining admin — that would
            // permanently lock everyone out with no way back in.
            $countStmt = $pdo->query('SELECT COUNT(*) AS count FROM admin_users');
            $count = (int) $countStmt->fetch(\PDO::FETCH_ASSOC)['count'];

            $stmt = $pdo->prepare('SELECT id FROM admin_users WHERE username = ?');
            $stmt->execute([$username]);
            if (!$stmt->fetch()) {
                Response::error('User not found', null, 404);
                return;
            }

            if ($count <= 1) {
                Response::error('Cannot delete the last remaining admin user', null, 409);
                return;
            }

            $stmt = $pdo->prepare('DELETE FROM admin_users WHERE username = ?');
            $stmt->execute([$username]);

            Response::success(null, 'User deleted');
        } catch (\Exception $e) {
            Response::error('Failed to delete user', [$e->getMessage()], 500);
        }
    }
}
