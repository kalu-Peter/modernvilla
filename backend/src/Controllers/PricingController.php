<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;

class PricingController
{
    public function getSeasonal(): void
    {
        try {
            $propertyName = Request::getQueryParam('property_name');

            $pdo = Connection::getInstance();

            if ($propertyName) {
                $stmt = $pdo->prepare('
                    SELECT * FROM seasonal_pricing 
                    WHERE property_name = ? 
                    ORDER BY start_date
                ');
                $stmt->execute([$propertyName]);
            } else {
                $stmt = $pdo->query('
                    SELECT * FROM seasonal_pricing 
                    ORDER BY property_name, start_date
                ');
            }

            $pricing = $stmt->fetchAll();
            Response::success($pricing, 'Seasonal pricing retrieved');
        } catch (\Exception $e) {
            Response::error('Failed to retrieve seasonal pricing', [$e->getMessage()], 500);
        }
    }

    public function updateSeasonal(): void
    {
        try {
            $method = $_SERVER['REQUEST_METHOD'];

            // Handle GET request - list seasonal pricing
            if ($method === 'GET') {
                $this->listSeasonal();
                return;
            }

            // Handle POST request - create new pricing
            if ($method === 'POST') {
                $this->createSeasonal();
                return;
            }

            // Handle PUT request - update pricing
            if ($method === 'PUT') {
                $this->updateSingleSeasonal();
                return;
            }

            // Handle DELETE request - delete pricing
            if ($method === 'DELETE') {
                $this->deleteSeasonal();
                return;
            }

            Response::error('Method not allowed', null, 405);
        } catch (\Exception $e) {
            Response::error('Seasonal pricing operation failed', [$e->getMessage()], 500);
        }
    }

    private function listSeasonal(): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->query('SELECT id, property_name, label, start_date, end_date, base_price, extra_person_fee, created_at FROM seasonal_pricing ORDER BY property_name, start_date');
            $pricing = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($pricing);
            exit;
        } catch (\Exception $e) {
            Response::error('Failed to fetch seasonal pricing', [$e->getMessage()], 500);
        }
    }

    private function createSeasonal(): void
    {
        try {
            $body = Request::getBody();

            $required = ['property_name', 'start_date', 'end_date', 'base_price'];
            foreach ($required as $field) {
                if (empty($body[$field])) {
                    Response::error("Missing required field: $field");
                    return;
                }
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('
                INSERT INTO seasonal_pricing 
                (property_name, label, start_date, end_date, base_price, extra_person_fee)
                VALUES (?, ?, ?, ?, ?, ?)
                RETURNING id, property_name, label, start_date, end_date, base_price, extra_person_fee
            ');

            $stmt->execute([
                $body['property_name'],
                $body['label'] ?? 'Custom Rate',
                $body['start_date'],
                $body['end_date'],
                $body['base_price'],
                $body['extra_person_fee'] ?? null
            ]);

            $pricing = $stmt->fetch(\PDO::FETCH_ASSOC);
            Response::success($pricing, 'Seasonal pricing created', 201);
        } catch (\Exception $e) {
            Response::error('Failed to create seasonal pricing', [$e->getMessage()], 500);
        }
    }

    private function updateSingleSeasonal(): void
    {
        try {
            $body = Request::getBody();
            $id = $body['id'] ?? ($_GET['id'] ?? null);

            if (!$id) {
                Response::error('Pricing ID required');
                return;
            }

            $pdo = Connection::getInstance();
            $updates = [];
            $params = [];

            if (isset($body['label'])) {
                $updates[] = 'label = ?';
                $params[] = $body['label'];
            }
            if (isset($body['start_date'])) {
                $updates[] = 'start_date = ?';
                $params[] = $body['start_date'];
            }
            if (isset($body['end_date'])) {
                $updates[] = 'end_date = ?';
                $params[] = $body['end_date'];
            }
            if (isset($body['base_price'])) {
                $updates[] = 'base_price = ?';
                $params[] = $body['base_price'];
            }
            if (isset($body['extra_person_fee'])) {
                $updates[] = 'extra_person_fee = ?';
                $params[] = $body['extra_person_fee'];
            }

            if (empty($updates)) {
                Response::error('No fields to update');
                return;
            }

            $params[] = $id;
            $query = 'UPDATE seasonal_pricing SET ' . implode(', ', $updates) . ' WHERE id = ?';
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);

            Response::success(null, 'Seasonal pricing updated', 200);
        } catch (\Exception $e) {
            Response::error('Failed to update seasonal pricing', [$e->getMessage()], 500);
        }
    }

    private function deleteSeasonal(): void
    {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                Response::error('Pricing ID required');
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('DELETE FROM seasonal_pricing WHERE id = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                Response::error('Seasonal pricing not found', null, 404);
                return;
            }

            Response::success(null, 'Seasonal pricing deleted', 200);
        } catch (\Exception $e) {
            Response::error('Failed to delete seasonal pricing', [$e->getMessage()], 500);
        }
    }
}
