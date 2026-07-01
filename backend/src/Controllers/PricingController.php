<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;

class PricingController
{
    /**
     * Fallback cleaning/monetary fees, only used for a property that has no
     * property_pricing row at all yet. Once a row exists, cleaning_fee and
     * linen_fee are real columns on it (set via /api/pricing/update_base)
     * instead of being hardcoded here.
     */
    private function getFeesForProperty(int $propertyId): array
    {
        $fees = [
            1 => ['cleaning_fee' => 80, 'linen_fee' => 80],  // Shelter A
            2 => ['cleaning_fee' => 80, 'linen_fee' => 80],  // Shelter B
            3 => ['cleaning_fee' => 40, 'linen_fee' => 40],  // La Maison Modern
            4 => ['cleaning_fee' => 40, 'linen_fee' => 40],  // Refuge de la Martre
        ];
        return $fees[$propertyId] ?? ['cleaning_fee' => 40, 'linen_fee' => 40];
    }

    /**
     * GET /api/pricing/property?property_id=1
     * Returns base pricing for a property
     */
    public function getPropertyPricing(): void
    {
        try {
            $propertyId = Request::getQueryParam('property_id');

            if (!$propertyId) {
                Response::error('Missing required parameter: property_id');
                return;
            }

            $pdo = Connection::getInstance();

            // Verify property exists
            $stmt = $pdo->prepare('SELECT id, name FROM properties WHERE id = ?');
            $stmt->execute([$propertyId]);
            $property = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$property) {
                Response::error('Property not found');
                return;
            }

            // Get pricing
            $stmt = $pdo->prepare('
                SELECT weekday_price, weekend_price, extra_person_fee, cleaning_fee, linen_fee, updated_at
                FROM property_pricing
                WHERE property_id = ?
            ');
            $stmt->execute([$propertyId]);
            $pricing = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$pricing) {
                $fees = $this->getFeesForProperty($propertyId);
                Response::success([
                    'property_id' => $propertyId,
                    'property_name' => $property['name'],
                    'weekday_price' => null,
                    'weekend_price' => null,
                    'extra_person_fee' => 0,
                    'cleaning_fee' => $fees['cleaning_fee'],
                    'linen_fee' => $fees['linen_fee'],
                    'updated_at' => null
                ]);
                return;
            }

            Response::success([
                'property_id' => $propertyId,
                'property_name' => $property['name'],
                'weekday_price' => floatval($pricing['weekday_price']),
                'weekend_price' => floatval($pricing['weekend_price']),
                'extra_person_fee' => floatval($pricing['extra_person_fee']),
                'cleaning_fee' => floatval($pricing['cleaning_fee']),
                'linen_fee' => floatval($pricing['linen_fee']),
                'updated_at' => $pricing['updated_at']
            ]);
        } catch (\Exception $e) {
            Response::error('Failed to get property pricing', [$e->getMessage()], 500);
        }
    }

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

            // Upsert by the table's single unique key (property_name, tier_type,
            // specific_date_key) — a generated column that normalizes
            // specific_date to a constant sentinel for weekend/yearly rows, so
            // one INSERT ... ON DUPLICATE KEY UPDATE covers both cases (see
            // schema.sql for why: MySQL has no partial/filtered unique index
            // like the two separate Postgres conflict targets this used to need).
            $stmt = $pdo->prepare('
                INSERT INTO pricing_tiers (property_name, tier_type, specific_date, base_price, extra_person_fee)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    base_price = VALUES(base_price),
                    extra_person_fee = VALUES(extra_person_fee),
                    updated_at = NOW()
            ');
            $stmt->execute([$propertyName, $tierType, $specificDate, $basePrice, $extraPersonFee]);

            $stmt = $pdo->prepare('
                SELECT id, property_name, tier_type, specific_date, base_price, extra_person_fee, updated_at
                FROM pricing_tiers
                WHERE property_name = ? AND tier_type = ? AND specific_date_key = ?
            ');
            $stmt->execute([$propertyName, $tierType, $specificDate ?? '0001-01-01']);
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
