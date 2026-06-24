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
                    SELECT * FROM pricing_tiers 
                    WHERE property_name = ? 
                    ORDER BY tier_type, specific_date
                ');
                $stmt->execute([$propertyName]);
            } else {
                $stmt = $pdo->query('
                    SELECT * FROM pricing_tiers 
                    ORDER BY property_name, tier_type, specific_date
                ');
            }

            $pricing = $stmt->fetchAll();
            Response::success($pricing, 'Pricing tiers retrieved');
        } catch (\Exception $e) {
            Response::error('Failed to retrieve pricing tiers', [$e->getMessage()], 500);
        }
    }

    public function updateSeasonal(): void
    {
        try {
            $method = $_SERVER['REQUEST_METHOD'];

            // Handle GET request - list pricing tiers
            if ($method === 'GET') {
                $this->listPricingTiers();
                return;
            }

            // Handle POST request - create or update pricing tier
            if ($method === 'POST') {
                $this->upsertPricingTier();
                return;
            }

            // Handle PUT request - update pricing tier
            if ($method === 'PUT') {
                $this->upsertPricingTier();
                return;
            }

            // Handle DELETE request - delete pricing tier
            if ($method === 'DELETE') {
                $this->deletePricingTier();
                return;
            }

            Response::error('Method not allowed', null, 405);
        } catch (\Exception $e) {
            Response::error('Pricing tier operation failed', [$e->getMessage()], 500);
        }
    }

    private function listPricingTiers(): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->query('
                SELECT id, property_name, tier_type, specific_date, base_price, extra_person_fee, created_at, updated_at 
                FROM pricing_tiers 
                ORDER BY property_name, tier_type, specific_date
            ');
            $tiers = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            header('Content-Type: application/json');
            echo json_encode($tiers);
            exit;
        } catch (\Exception $e) {
            Response::error('Failed to fetch pricing tiers', [$e->getMessage()], 500);
        }
    }

    private function upsertPricingTier(): void
    {
        try {
            $body = Request::getBody();

            $required = ['property_name', 'tier_type', 'base_price'];
            foreach ($required as $field) {
                if (empty($body[$field])) {
                    Response::error("Missing required field: $field");
                    return;
                }
            }

            $tierType = $body['tier_type'];
            if (!in_array($tierType, ['single_day', 'weekend', 'yearly'])) {
                Response::error("Invalid tier_type. Must be 'single_day', 'weekend', or 'yearly'");
                return;
            }

            if ($tierType === 'single_day' && empty($body['specific_date'])) {
                Response::error("specific_date is required for single_day pricing");
                return;
            }

            if ($tierType !== 'single_day' && !empty($body['specific_date'])) {
                Response::error("specific_date should only be used for single_day pricing");
                return;
            }

            $pdo = Connection::getInstance();
            $propertyName = $body['property_name'];
            $basePrice = $body['base_price'];
            $extraPersonFee = $body['extra_person_fee'] ?? null;
            $specificDate = $body['specific_date'] ?? null;

            // Check if property exists
            $stmt = $pdo->prepare('SELECT name FROM properties WHERE name = ?');
            $stmt->execute([$propertyName]);
            if (!$stmt->fetch()) {
                Response::error('Property not found');
                return;
            }

            // For single_day: upsert by (property_name, tier_type, specific_date)
            // For weekend/yearly: upsert by (property_name, tier_type)
            if ($tierType === 'single_day') {
                $stmt = $pdo->prepare('
                    INSERT INTO pricing_tiers (property_name, tier_type, specific_date, base_price, extra_person_fee)
                    VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT (property_name, tier_type, specific_date) 
                    DO UPDATE SET 
                        base_price = EXCLUDED.base_price,
                        extra_person_fee = EXCLUDED.extra_person_fee,
                        updated_at = NOW()
                    RETURNING id, property_name, tier_type, specific_date, base_price, extra_person_fee, updated_at
                ');
                $stmt->execute([$propertyName, $tierType, $specificDate, $basePrice, $extraPersonFee]);
            } else {
                $stmt = $pdo->prepare('
                    INSERT INTO pricing_tiers (property_name, tier_type, base_price, extra_person_fee)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT (property_name, tier_type) 
                    DO UPDATE SET 
                        base_price = EXCLUDED.base_price,
                        extra_person_fee = EXCLUDED.extra_person_fee,
                        updated_at = NOW()
                    RETURNING id, property_name, tier_type, specific_date, base_price, extra_person_fee, updated_at
                ');
                $stmt->execute([$propertyName, $tierType, $basePrice, $extraPersonFee]);
            }

            $result = $stmt->fetch(\PDO::FETCH_ASSOC);
            Response::success($result, 'Pricing tier saved successfully', 201);
        } catch (\Exception $e) {
            Response::error('Failed to save pricing tier', [$e->getMessage()], 500);
        }
    }

    private function deletePricingTier(): void
    {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                Response::error('Pricing tier ID required');
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('DELETE FROM pricing_tiers WHERE id = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                Response::error('Pricing tier not found', null, 404);
                return;
            }

            Response::success(null, 'Pricing tier deleted successfully', 200);
        } catch (\Exception $e) {
            Response::error('Failed to delete pricing tier', [$e->getMessage()], 500);
        }
    }
}
