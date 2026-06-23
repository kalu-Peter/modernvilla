<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;

class AdminController
{
    // Store valid tokens in memory (in production, use Redis or database)
    private static $validTokens = [];

    public function login(): void
    {
        try {
            $method = $_SERVER['REQUEST_METHOD'];
            $action = $_GET['action'] ?? null;

            // Handle GET request - list all users
            if ($method === 'GET' && !$action) {
                $this->listUsers();
                return;
            }

            // Handle DELETE request - remove user
            if ($method === 'DELETE') {
                $this->deleteUser();
                return;
            }

            // Handle POST with create action
            if ($method === 'POST' && $action === 'create') {
                $this->createUser();
                return;
            }

            // Handle POST login (default POST behavior)
            if ($method === 'POST' && !$action) {
                $this->loginUser();
                return;
            }

            // If we get here, method not allowed
            Response::error('Method not allowed', null, 405);
        } catch (\Exception $e) {
            Response::error('Admin operation failed', [$e->getMessage()], 500);
        }
    }

    private function loginUser(): void
    {
        try {
            $body = Request::getBody();
            $username = $body['username'] ?? null;
            $password = $body['password'] ?? null;

            if (!$username || !$password) {
                Response::error('Username and password required');
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('SELECT id, username, password_hash FROM admin_users WHERE username = ?');
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password_hash'])) {
                Response::error('Invalid credentials', null, 401);
                return;
            }

            $token = $this->generateToken();
            Response::success([
                'id' => $user['id'],
                'username' => $user['username'],
                'secret' => $token
            ], 'Login successful', 200);
        } catch (\Exception $e) {
            Response::error('Login failed', [$e->getMessage()], 500);
        }
    }

    private function listUsers(): void
    {
        try {
            // Check authentication
            if (!$this->isAdminAuthenticated()) {
                Response::error('Unauthorized', null, 401);
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->query('SELECT id, username, created_at FROM admin_users ORDER BY created_at DESC');
            $users = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($users);
            exit;
        } catch (\Exception $e) {
            Response::error('Failed to fetch users', [$e->getMessage()], 500);
        }
    }

    private function deleteUser(): void
    {
        try {
            // Check authentication
            if (!$this->isAdminAuthenticated()) {
                Response::error('Unauthorized', null, 401);
                return;
            }

            $id = $_GET['id'] ?? null;
            if (!$id) {
                Response::error('User ID required');
                return;
            }

            $pdo = Connection::getInstance();

            // Don't allow deleting the only admin user
            $stmt = $pdo->query('SELECT COUNT(*) as count FROM admin_users');
            $result = $stmt->fetch();
            if ($result['count'] <= 1) {
                Response::error('Cannot delete the last admin user');
                return;
            }

            // Delete the user
            $stmt = $pdo->prepare('DELETE FROM admin_users WHERE id = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                Response::error('User not found', null, 404);
                return;
            }

            Response::success([], 'User deleted', 200);
        } catch (\Exception $e) {
            Response::error('Delete failed', [$e->getMessage()], 500);
        }
    }

    private function createUser(): void
    {
        try {
            // Check authentication
            if (!$this->isAdminAuthenticated()) {
                Response::error('Unauthorized', null, 401);
                return;
            }

            $body = Request::getBody();
            $username = $body['username'] ?? null;
            $password = $body['password'] ?? null;

            if (!$username || !$password) {
                Response::error('Username and password required');
                return;
            }

            if (strlen($password) < 8) {
                Response::error('Password must be at least 8 characters');
                return;
            }

            $pdo = Connection::getInstance();

            // Check if username already exists
            $stmt = $pdo->prepare('SELECT id FROM admin_users WHERE username = ?');
            $stmt->execute([strtolower(trim($username))]);
            if ($stmt->fetch()) {
                Response::error('Username already exists', null, 409);
                return;
            }

            // Hash password and create user
            $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $pdo->prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?) RETURNING id, username, created_at');
            $stmt->execute([strtolower(trim($username)), $hash]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            http_response_code(201);
            echo json_encode([
                'message' => 'User created',
                'user' => $user
            ]);
            exit;
        } catch (\Exception $e) {
            Response::error('User creation failed', [$e->getMessage()], 500);
        }
    }

    private function isAdminAuthenticated(): bool
    {
        // Get token from Authorization header, X-Admin-Secret header, or query parameter
        $headers = getallheaders();
        $token = null;

        // Check various header names (case-insensitive lookup)
        foreach (['Authorization', 'X-Admin-Secret', 'x-admin-secret'] as $header) {
            if (isset($headers[$header])) {
                $token = $headers[$header];
                break;
            }
        }

        // Check query parameter as fallback
        if (!$token) {
            $token = $_GET['secret'] ?? null;
        }

        // Remove "Bearer " prefix if present
        if ($token && strpos($token, 'Bearer ') === 0) {
            $token = substr($token, 7);
        }

        if (!$token) {
            return false;
        }

        // TODO: In production, validate token against database/cache
        // For now, accept any non-empty token (should be implemented properly)
        return !empty($token);
    }

    private function generateToken(): string
    {
        return bin2hex(random_bytes(32));
    }
}
