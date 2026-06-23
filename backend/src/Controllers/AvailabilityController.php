<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;

class AvailabilityController
{
    public function check(): void
    {
        try {
            $property = Request::getQueryParam('property');
            $checkin = Request::getQueryParam('checkin');
            $checkout = Request::getQueryParam('checkout');

            if (!$property || !$checkin || !$checkout) {
                Response::error('Missing required parameters: property, checkin, checkout');
                return;
            }

            $pdo = Connection::getInstance();

            // Check for blocked dates or existing reservations
            $stmt = $pdo->prepare('
                SELECT COUNT(*) as count FROM reservations 
                WHERE property_name = ? 
                AND cancelled = false
                AND ((checkin < ? AND checkout > ?) OR (checkin < ? AND checkout > ?))
            ');

            $stmt->execute([$property, $checkout, $checkin, $checkout, $checkin]);
            $result = $stmt->fetch();

            $available = $result['count'] == 0;

            Response::success([
                'available' => $available,
                'property' => $property,
                'checkin' => $checkin,
                'checkout' => $checkout
            ]);
        } catch (\Exception $e) {
            Response::error('Failed to check availability', [$e->getMessage()], 500);
        }
    }

    public function removeBlockedDate(string $id = ''): void
    {
        try {
            // Check if this is an admin operation (GET/POST/PUT/DELETE for blocked dates)
            $method = $_SERVER['REQUEST_METHOD'];

            if ($method === 'GET') {
                $action = $_GET['action'] ?? null;
                if ($action === 'ical-urls') {
                    $this->getICalUrls();
                } else {
                    $this->listBlockedDates();
                }
                return;
            }

            if ($method === 'POST') {
                $this->createBlockedDate();
                return;
            }

            if ($method === 'PUT') {
                $this->updateBlockedDate();
                return;
            }

            if ($method === 'DELETE') {
                $this->deleteBlockedDate();
                return;
            }

            // Original functionality - delete by ID
            if (!empty($id)) {
                $this->deleteBlockedDateById($id);
            }
        } catch (\Exception $e) {
            Response::error('Blocked date operation failed', [$e->getMessage()], 500);
        }
    }

    private function deleteBlockedDateById(string $id): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('DELETE FROM blocked_dates WHERE id = ?');
            $stmt->execute([$id]);

            Response::success(null, 'Blocked date removed', 200);
        } catch (\Exception $e) {
            Response::error('Failed to remove blocked date', [$e->getMessage()], 500);
        }
    }

    private function listBlockedDates(): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->query('SELECT id, property_name, blocked_date, reason, created_at FROM blocked_dates ORDER BY blocked_date DESC');
            $dates = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($dates);
            exit;
        } catch (\Exception $e) {
            Response::error('Failed to fetch blocked dates', [$e->getMessage()], 500);
        }
    }

    private function getICalUrls(): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->query('SELECT DISTINCT property_name FROM blocked_dates ORDER BY property_name');
            $urls = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($urls);
            exit;
        } catch (\Exception $e) {
            Response::error('Failed to fetch iCal URLs', [$e->getMessage()], 500);
        }
    }

    private function createBlockedDate(): void
    {
        try {
            $body = Request::getBody();
            $property = $body['property_name'] ?? null;
            $blockedDate = $body['blocked_date'] ?? null;
            $reason = $body['reason'] ?? 'manual_block';

            if (!$property || !$blockedDate) {
                Response::error('Property name and blocked_date are required');
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('
                INSERT INTO blocked_dates (property_name, blocked_date, reason)
                VALUES (?, ?, ?)
                RETURNING id, property_name, blocked_date, reason, created_at
            ');

            $stmt->execute([$property, $blockedDate, $reason]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);

            Response::success($result, 'Blocked date created', 201);
        } catch (\Exception $e) {
            Response::error('Failed to create blocked date', [$e->getMessage()], 500);
        }
    }

    private function updateBlockedDate(): void
    {
        try {
            $body = Request::getBody();
            $id = $body['id'] ?? ($_GET['id'] ?? null);

            if (!$id) {
                Response::error('Blocked date ID required');
                return;
            }

            $pdo = Connection::getInstance();
            $updates = [];
            $params = [];

            if (isset($body['blocked_date'])) {
                $updates[] = 'blocked_date = ?';
                $params[] = $body['blocked_date'];
            }
            if (isset($body['reason'])) {
                $updates[] = 'reason = ?';
                $params[] = $body['reason'];
            }

            if (empty($updates)) {
                Response::error('No fields to update');
                return;
            }

            $params[] = $id;
            $query = 'UPDATE blocked_dates SET ' . implode(', ', $updates) . ' WHERE id = ?';
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);

            Response::success(null, 'Blocked date updated', 200);
        } catch (\Exception $e) {
            Response::error('Failed to update blocked date', [$e->getMessage()], 500);
        }
    }

    private function deleteBlockedDate(): void
    {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                Response::error('Blocked date ID required');
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('DELETE FROM blocked_dates WHERE id = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                Response::error('Blocked date not found', null, 404);
                return;
            }

            Response::success(null, 'Blocked date deleted', 200);
        } catch (\Exception $e) {
            Response::error('Failed to delete blocked date', [$e->getMessage()], 500);
        }
    }
}
