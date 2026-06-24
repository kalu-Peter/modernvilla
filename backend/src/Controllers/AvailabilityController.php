<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;

class AvailabilityController
{
    /**
     * Get hardcoded cleaning and monetary fees for a property
     * Fees in KES (converted from EUR using ~130 KES/EUR rate)
     * - Shelter A (1): 80 EUR = 10,400 KES
     * - Shelter B (2): 80 EUR = 10,400 KES
     * - La Maison Modern (3): 40 EUR = 5,200 KES
     * - Refuge de la Martre (4): 40 EUR = 5,200 KES
     */
    private function getFeesForProperty(int $propertyId): array
    {
        $fees = [
            1 => ['cleaning_fee' => 10400, 'monetary_fee' => 10400],  // Shelter A
            2 => ['cleaning_fee' => 10400, 'monetary_fee' => 10400],  // Shelter B
            3 => ['cleaning_fee' => 5200, 'monetary_fee' => 5200],    // La Maison Modern
            4 => ['cleaning_fee' => 5200, 'monetary_fee' => 5200],    // Refuge de la Martre
        ];
        return $fees[$propertyId] ?? ['cleaning_fee' => 5200, 'monetary_fee' => 5200];
    }

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

            // Get property ID from name
            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('SELECT id FROM properties WHERE name = ?');
            $stmt->execute([$property]);
            $propertyResult = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$propertyResult) {
                Response::error('Property not found');
                return;
            }

            $propertyId = $propertyResult['id'];

            // Check for overlapping reservations (not cancelled)
            $stmt = $pdo->prepare('
                SELECT COUNT(*) as count FROM reservations 
                WHERE property_id = ? 
                AND cancelled = false
                AND (
                    (checkin::date < ?::date AND checkout::date > ?::date) OR
                    (checkin::date <= ?::date AND checkout::date >= ?::date) OR
                    (checkin::date < ?::date AND checkout::date > ?::date)
                )
            ');

            $stmt->execute([$propertyId, $checkout, $checkin, $checkin, $checkout, $checkout, $checkin]);
            $result = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($result && $result['count'] > 0) {
                Response::success([
                    'available' => false,
                    'property' => $property,
                    'property_id' => $propertyId,
                    'checkin' => $checkin,
                    'checkout' => $checkout,
                    'reason' => 'Property is booked for these dates'
                ]);
                return;
            }

            Response::success([
                'available' => true,
                'property' => $property,
                'property_id' => $propertyId,
                'checkin' => $checkin,
                'checkout' => $checkout
            ]);
        } catch (\Exception $e) {
            Response::error('Failed to check availability', [$e->getMessage()], 500);
        }
    }

    /**
     * GET /api/availability/batch?checkin=2026-06-24&checkout=2026-06-27
     * Returns availability status for all properties
     */
    public function checkBatch(): void
    {
        try {
            $checkin = Request::getQueryParam('checkin');
            $checkout = Request::getQueryParam('checkout');

            if (!$checkin || !$checkout) {
                Response::error('Missing required parameters: checkin, checkout');
                return;
            }

            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkin) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $checkout)) {
                Response::error('Invalid date format. Use YYYY-MM-DD');
                return;
            }

            $pdo = Connection::getInstance();

            // Get all properties
            $stmt = $pdo->prepare('SELECT id, name, max_guests FROM properties ORDER BY id');
            $stmt->execute();
            $properties = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $results = [];

            foreach ($properties as $property) {
                $propertyId = $property['id'];

                // Check for overlapping reservations
                $stmt = $pdo->prepare('
                    SELECT COUNT(*) as count FROM reservations 
                    WHERE property_id = ? 
                    AND cancelled = false
                    AND (
                        (checkin::date < ?::date AND checkout::date > ?::date) OR
                        (checkin::date <= ?::date AND checkout::date >= ?::date) OR
                        (checkin::date < ?::date AND checkout::date > ?::date)
                    )
                ');

                $stmt->execute([$propertyId, $checkout, $checkin, $checkin, $checkout, $checkout, $checkin]);
                $reservationResult = $stmt->fetch(\PDO::FETCH_ASSOC);

                $available = !($reservationResult && $reservationResult['count'] > 0);

                // Get pricing for this property
                $stmt = $pdo->prepare('
                    SELECT weekday_price, weekend_price, extra_person_fee 
                    FROM property_pricing 
                    WHERE property_id = ?
                ');
                $stmt->execute([$propertyId]);
                $pricing = $stmt->fetch(\PDO::FETCH_ASSOC);

                $fees = $this->getFeesForProperty($propertyId);

                $results[] = [
                    'property_id' => $propertyId,
                    'name' => $property['name'],
                    'max_guests' => $property['max_guests'],
                    'available' => $available,
                    'pricing' => $pricing ? [
                        'weekday_price' => floatval($pricing['weekday_price']),
                        'weekend_price' => floatval($pricing['weekend_price']),
                        'extra_person_fee' => floatval($pricing['extra_person_fee']),
                        'cleaning_fee' => $fees['cleaning_fee'],
                        'monetary_fee' => $fees['monetary_fee']
                    ] : null
                ];
            }

            Response::success([
                'checkin' => $checkin,
                'checkout' => $checkout,
                'properties' => $results
            ]);
        } catch (\Exception $e) {
            Response::error('Failed to check batch availability', [$e->getMessage()], 500);
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
