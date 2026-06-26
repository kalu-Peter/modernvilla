<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;
use App\Helpers\Uuid;

class ReservationsController
{
    public function create(): void
    {
        try {
            $body = Request::getBody();

            $required = ['property_name', 'guests', 'checkin', 'checkout', 'name', 'phone', 'email', 'total_price'];
            foreach ($required as $field) {
                if (empty($body[$field])) {
                    Response::error("Missing required field: $field");
                    return;
                }
            }

            // Validate dates
            if (strtotime($body['checkout']) <= strtotime($body['checkin'])) {
                Response::error('Checkout date must be after checkin date');
                return;
            }

            $pdo = Connection::getInstance();

            // Check availability
            $availStmt = $pdo->prepare('
                SELECT COUNT(*) as count FROM reservations 
                WHERE property_name = ? 
                AND cancelled = false
                AND ((checkin < ? AND checkout > ?))
            ');
            $availStmt->execute([$body['property_name'], $body['checkout'], $body['checkin']]);
            $available = $availStmt->fetch();

            if ($available['count'] > 0) {
                Response::error('Property not available for selected dates', null, 409);
                return;
            }

            // Resolve property_id alongside property_name so the
            // AvailabilityController overlap checks (which filter by
            // property_id) can see this reservation.
            $propIdStmt = $pdo->prepare('SELECT id FROM properties WHERE name = ?');
            $propIdStmt->execute([$body['property_name']]);
            $propertyId = $propIdStmt->fetchColumn() ?: null;

            // Create reservation. id is generated here (not by the database —
            // MySQL has no equivalent to Postgres's gen_random_uuid() default).
            $id = Uuid::v4();
            $stmt = $pdo->prepare('
                INSERT INTO reservations
                (id, property_name, property_id, guests, checkin, checkout, name, phone, email, total_price, payment_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $id,
                $body['property_name'],
                $propertyId,
                $body['guests'],
                $body['checkin'],
                $body['checkout'],
                $body['name'],
                $body['phone'],
                $body['email'],
                $body['total_price'],
                'pending'
            ]);

            Response::success(null, 'Reservation created successfully', 201);
        } catch (\Exception $e) {
            Response::error('Failed to create reservation', [$e->getMessage()], 500);
        }
    }

    public function update(): void
    {
        try {
            // Check if this is an admin operation (GET/DELETE for listing/management)
            $method = $_SERVER['REQUEST_METHOD'];
            if ($method === 'GET') {
                $this->fetchAll();
                return;
            }
            if ($method === 'DELETE') {
                $this->delete();
                return;
            }

            $body = Request::getBody();
            $id = $body['id'] ?? null;

            if (!$id) {
                Response::error('Reservation ID required');
                return;
            }

            $pdo = Connection::getInstance();
            $updates = [];
            $params = [];

            if (isset($body['payment_status'])) {
                $updates[] = 'payment_status = ?';
                $params[] = $body['payment_status'];
            }
            if (isset($body['confirmed'])) {
                $updates[] = 'confirmed = ?';
                $params[] = $body['confirmed'] ? true : false;
            }
            if (isset($body['cancelled'])) {
                $updates[] = 'cancelled = ?';
                $params[] = $body['cancelled'] ? true : false;
            }

            if (empty($updates)) {
                Response::error('No fields to update');
                return;
            }

            $params[] = $id;
            $query = 'UPDATE reservations SET ' . implode(', ', $updates) . ' WHERE id = ?';
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);

            Response::success(null, 'Reservation updated', 200);
        } catch (\Exception $e) {
            Response::error('Failed to update reservation', [$e->getMessage()], 500);
        }
    }

    private function fetchAll(): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->query('SELECT id, property_name, guests, checkin, checkout, name, phone, email, total_price, payment_status, confirmed, cancelled, created_at FROM reservations ORDER BY checkin DESC');
            $reservations = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($reservations);
            exit;
        } catch (\Exception $e) {
            Response::error('Failed to fetch reservations', [$e->getMessage()], 500);
        }
    }

    private function delete(): void
    {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                Response::error('Reservation ID required');
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('DELETE FROM reservations WHERE id = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                Response::error('Reservation not found', null, 404);
                return;
            }

            Response::success(null, 'Reservation deleted', 200);
        } catch (\Exception $e) {
            Response::error('Failed to delete reservation', [$e->getMessage()], 500);
        }
    }
}
