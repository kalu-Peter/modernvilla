<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;

class PricingCalendarController
{
    /**
     * GET /api/pricing/calendar?property_id=1&month=2026-12
     * Returns calendar data with base pricing and overrides
     */
    public function getCalendar()
    {
        try {
            $propertyId = Request::getQueryParam('property_id');
            $month = Request::getQueryParam('month'); // format: YYYY-MM

            if (!$propertyId || !$month) {
                return Response::error('Missing property_id or month parameter', null, 400);
            }

            // Validate month format (YYYY-MM)
            if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
                return Response::error('Invalid month format. Use YYYY-MM', null, 400);
            }

            $pdo = Connection::getInstance();

            // Get property info
            $stmt = $pdo->prepare('
                SELECT id, name, max_guests FROM properties WHERE id = ?
            ');
            $stmt->execute([$propertyId]);
            $property = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$property) {
                return Response::error('Property not found', null, 404);
            }

            // Get base pricing
            $stmt = $pdo->prepare('
                SELECT weekday_price, weekend_price, extra_person_fee
                FROM property_pricing
                WHERE property_id = ?
            ');
            $stmt->execute([$propertyId]);
            $basePricing = $stmt->fetch(\PDO::FETCH_ASSOC) ?: [
                'weekday_price' => null,
                'weekend_price' => null,
                'extra_person_fee' => 0
            ];

            // Get overrides for the month
            $startDate = $month . '-01';
            $endDate = date('Y-m-t', strtotime($startDate));

            $stmt = $pdo->prepare('
                SELECT override_date, price, reason
                FROM pricing_overrides
                WHERE property_id = ?
                  AND override_date >= ?
                  AND override_date <= ?
                ORDER BY override_date
            ');
            $stmt->execute([$propertyId, $startDate, $endDate]);
            $overridesData = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $overrides = [];
            foreach ($overridesData as $row) {
                $overrides[$row['override_date']] = [
                    'price' => floatval($row['price']),
                    'reason' => $row['reason']
                ];
            }

            return Response::success([
                'property' => $property,
                'base_pricing' => $basePricing,
                'overrides' => $overrides,
                'month' => $month
            ]);
        } catch (\Exception $e) {
            return Response::error('Error fetching calendar: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * POST /api/pricing/save_override
     * Create or update a pricing override (upsert)
     */
    public function saveOverride()
    {
        try {
            $propertyId = Request::getBodyParam('property_id');
            $overrideDate = Request::getBodyParam('override_date');
            $price = Request::getBodyParam('price');
            $reason = Request::getBodyParam('reason');

            if (!$propertyId || !$overrideDate || !$price) {
                return Response::error('Missing required fields: property_id, override_date, price', null, 400);
            }

            // Validate price is positive
            if (floatval($price) <= 0) {
                return Response::error('Price must be greater than 0', null, 400);
            }

            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $overrideDate)) {
                return Response::error('Invalid date format. Use YYYY-MM-DD', null, 400);
            }

            $pdo = Connection::getInstance();

            // Verify property exists
            $stmt = $pdo->prepare('SELECT id FROM properties WHERE id = ?');
            $stmt->execute([$propertyId]);
            if (!$stmt->fetch(\PDO::FETCH_ASSOC)) {
                return Response::error('Property not found', null, 404);
            }

            // UPSERT: Insert or update using PostgreSQL ON CONFLICT
            $stmt = $pdo->prepare('
                INSERT INTO pricing_overrides (property_id, override_date, price, reason, updated_at)
                VALUES (?, ?, ?, ?, NOW())
                ON CONFLICT (property_id, override_date)
                DO UPDATE SET
                    price = EXCLUDED.price,
                    reason = EXCLUDED.reason,
                    updated_at = NOW()
                RETURNING override_date, price, reason
            ');
            $stmt->execute([$propertyId, $overrideDate, $price, $reason]);

            if ($stmt->rowCount() === 0) {
                return Response::error('Failed to save override', null, 500);
            }

            $saved = $stmt->fetch(\PDO::FETCH_ASSOC);

            return Response::success([
                'message' => 'Price override saved',
                'override' => [
                    'override_date' => $saved['override_date'],
                    'price' => floatval($saved['price']),
                    'reason' => $saved['reason']
                ]
            ]);
        } catch (\Exception $e) {
            return Response::error('Error saving override: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * DELETE /api/pricing/delete_override
     * Remove a pricing override
     */
    public function deleteOverride()
    {
        try {
            $propertyId = Request::getBodyParam('property_id');
            $overrideDate = Request::getBodyParam('override_date');

            if (!$propertyId || !$overrideDate) {
                return Response::error('Missing required fields: property_id, override_date', null, 400);
            }

            $pdo = Connection::getInstance();

            // Delete the override
            $stmt = $pdo->prepare('
                DELETE FROM pricing_overrides
                WHERE property_id = ? AND override_date = ?
                RETURNING override_date
            ');
            $stmt->execute([$propertyId, $overrideDate]);

            if ($stmt->rowCount() === 0) {
                return Response::error('Override not found', null, 404);
            }

            return Response::success([
                'message' => 'Price override deleted',
                'deleted_date' => $overrideDate
            ]);
        } catch (\Exception $e) {
            return Response::error('Error deleting override: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * POST /api/pricing/update_base
     * Update base weekday and weekend prices (UPSERT)
     */
    public function updateBasePricing()
    {
        try {
            $propertyId = Request::getBodyParam('property_id');
            $weekdayPrice = Request::getBodyParam('weekday_price');
            $weekendPrice = Request::getBodyParam('weekend_price');
            $extraPersonFee = Request::getBodyParam('extra_person_fee');

            if (!$propertyId || !$weekdayPrice || !$weekendPrice) {
                return Response::error('Missing required fields: property_id, weekday_price, weekend_price', null, 400);
            }

            // Validate prices are positive
            if (floatval($weekdayPrice) <= 0 || floatval($weekendPrice) <= 0) {
                return Response::error('Prices must be greater than 0', null, 400);
            }

            if ($extraPersonFee !== null && floatval($extraPersonFee) < 0) {
                return Response::error('Extra person fee cannot be negative', null, 400);
            }

            $pdo = Connection::getInstance();

            // Verify property exists
            $stmt = $pdo->prepare('SELECT id FROM properties WHERE id = ?');
            $stmt->execute([$propertyId]);
            if (!$stmt->fetch(\PDO::FETCH_ASSOC)) {
                return Response::error('Property not found', null, 404);
            }

            // UPSERT: Insert or update using PostgreSQL ON CONFLICT
            $stmt = $pdo->prepare('
                INSERT INTO property_pricing (property_id, weekday_price, weekend_price, extra_person_fee, updated_at)
                VALUES (?, ?, ?, ?, NOW())
                ON CONFLICT (property_id)
                DO UPDATE SET
                    weekday_price = EXCLUDED.weekday_price,
                    weekend_price = EXCLUDED.weekend_price,
                    extra_person_fee = EXCLUDED.extra_person_fee,
                    updated_at = NOW()
                RETURNING property_id, weekday_price, weekend_price, extra_person_fee
            ');
            $stmt->execute([
                $propertyId,
                floatval($weekdayPrice),
                floatval($weekendPrice),
                $extraPersonFee !== null ? floatval($extraPersonFee) : 0
            ]);

            if ($stmt->rowCount() === 0) {
                return Response::error('Failed to update base pricing', null, 500);
            }

            $result = $stmt->fetch(\PDO::FETCH_ASSOC);

            return Response::success([
                'message' => 'Base pricing updated',
                'property_id' => $result['property_id'],
                'weekday_price' => floatval($result['weekday_price']),
                'weekend_price' => floatval($result['weekend_price']),
                'extra_person_fee' => floatval($result['extra_person_fee'])
            ]);
        } catch (\Exception $e) {
            return Response::error('Error updating base pricing: ' . $e->getMessage(), null, 500);
        }
    }
}
