<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;

class AvailabilityController
{
    /**
     * Get hardcoded cleaning and monetary fees for a property
     * Fees in EUR
     * - Shelter A (1): 80 EUR
     * - Shelter B (2): 80 EUR
     * - La Maison Modern (3): 40 EUR
     * - Refuge de la Martre (4): 40 EUR
     */
    private function getFeesForProperty(int $propertyId): array
    {
        $fees = [
            1 => ['cleaning_fee' => 80, 'monetary_fee' => 80],  // Shelter A
            2 => ['cleaning_fee' => 80, 'monetary_fee' => 80],  // Shelter B
            3 => ['cleaning_fee' => 40, 'monetary_fee' => 40],  // La Maison Modern
            4 => ['cleaning_fee' => 40, 'monetary_fee' => 40],  // Refuge de la Martre
        ];
        return $fees[$propertyId] ?? ['cleaning_fee' => 40, 'monetary_fee' => 40];
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
                    (checkin < ? AND checkout > ?) OR
                    (checkin <= ? AND checkout >= ?) OR
                    (checkin < ? AND checkout > ?)
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
                        (checkin < ? AND checkout > ?) OR
                        (checkin <= ? AND checkout >= ?) OR
                        (checkin < ? AND checkout > ?)
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

    /**
     * GET /api/availability/calendar?property_id=1
     * Returns manual/maintenance blocks, iCal sources, and imported events for a property
     */
    public function getCalendar(): void
    {
        try {
            $propertyId = Request::getQueryParam('property_id');

            if (!$propertyId) {
                Response::error('Missing required parameter: property_id');
                return;
            }

            $pdo = Connection::getInstance();

            $stmt = $pdo->prepare('SELECT id FROM properties WHERE id = ?');
            $stmt->execute([$propertyId]);
            if (!$stmt->fetch(\PDO::FETCH_ASSOC)) {
                Response::error('Property not found', null, 404);
                return;
            }

            $stmt = $pdo->prepare('
                SELECT id, property_id, start_date, end_date, block_type, source_reference, notes, created_at, updated_at
                FROM property_blocks
                WHERE property_id = ?
                ORDER BY start_date
            ');
            $stmt->execute([$propertyId]);
            $blocks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $stmt = $pdo->prepare('
                SELECT id, property_id, provider, ical_url, last_sync_at, created_at, updated_at
                FROM property_ical_sources
                WHERE property_id = ?
                ORDER BY provider
            ');
            $stmt->execute([$propertyId]);
            $icalSources = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            $stmt = $pdo->prepare('
                SELECT id, property_id, external_uid, source_provider, start_date, end_date, summary, last_seen_at, created_at
                FROM imported_calendar_events
                WHERE property_id = ?
                ORDER BY start_date
            ');
            $stmt->execute([$propertyId]);
            $importedEvents = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            Response::success([
                'blocks' => $blocks,
                'ical_sources' => $icalSources,
                'imported_events' => $importedEvents,
            ]);
        } catch (\Exception $e) {
            Response::error('Failed to fetch calendar data', [$e->getMessage()], 500);
        }
    }

    /**
     * POST /api/availability/create_block
     * Body: property_id, start_date, end_date, block_type, notes
     */
    public function createBlock(): void
    {
        try {
            $body = Request::getBody();
            $propertyId = $body['property_id'] ?? null;
            $startDate = $body['start_date'] ?? null;
            $endDate = $body['end_date'] ?? null;
            $blockType = $body['block_type'] ?? 'manual';
            $notes = $body['notes'] ?? null;

            if (!$propertyId || !$startDate || !$endDate) {
                Response::error('Missing required fields: property_id, start_date, end_date');
                return;
            }

            if (!in_array($blockType, ['manual', 'maintenance'], true)) {
                Response::error('block_type must be manual or maintenance');
                return;
            }

            if (strtotime($endDate) < strtotime($startDate)) {
                Response::error('end_date must be on or after start_date');
                return;
            }

            $pdo = Connection::getInstance();

            $stmt = $pdo->prepare('SELECT id FROM properties WHERE id = ?');
            $stmt->execute([$propertyId]);
            if (!$stmt->fetch(\PDO::FETCH_ASSOC)) {
                Response::error('Property not found', null, 404);
                return;
            }

            $stmt = $pdo->prepare('
                INSERT INTO property_blocks (property_id, start_date, end_date, block_type, notes)
                VALUES (?, ?, ?, ?, ?)
            ');
            $stmt->execute([$propertyId, $startDate, $endDate, $blockType, $notes]);
            $newId = $pdo->lastInsertId();

            $stmt = $pdo->prepare('
                SELECT id, property_id, start_date, end_date, block_type, source_reference, notes, created_at, updated_at
                FROM property_blocks WHERE id = ?
            ');
            $stmt->execute([$newId]);
            $block = $stmt->fetch(\PDO::FETCH_ASSOC);

            Response::success($block, 'Block created', 201);
        } catch (\Exception $e) {
            Response::error('Failed to create block', [$e->getMessage()], 500);
        }
    }

    /**
     * POST /api/availability/update_block
     * Body: id, start_date, end_date, block_type, notes
     */
    public function updateBlock(): void
    {
        try {
            $body = Request::getBody();
            $id = $body['id'] ?? null;

            if (!$id) {
                Response::error('Block id is required');
                return;
            }

            $pdo = Connection::getInstance();

            $stmt = $pdo->prepare('SELECT id, block_type FROM property_blocks WHERE id = ?');
            $stmt->execute([$id]);
            $existing = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$existing) {
                Response::error('Block not found', null, 404);
                return;
            }

            if ($existing['block_type'] !== 'manual') {
                Response::error('Only manual blocks can be edited', null, 403);
                return;
            }

            $startDate = $body['start_date'] ?? null;
            $endDate = $body['end_date'] ?? null;

            if ($startDate && $endDate && strtotime($endDate) < strtotime($startDate)) {
                Response::error('end_date must be on or after start_date');
                return;
            }

            $updates = [];
            $params = [];

            if (isset($body['start_date'])) {
                $updates[] = 'start_date = ?';
                $params[] = $body['start_date'];
            }
            if (isset($body['end_date'])) {
                $updates[] = 'end_date = ?';
                $params[] = $body['end_date'];
            }
            if (array_key_exists('notes', $body)) {
                $updates[] = 'notes = ?';
                $params[] = $body['notes'];
            }

            if (empty($updates)) {
                Response::error('No fields to update');
                return;
            }

            $updates[] = 'updated_at = NOW()';
            $params[] = $id;

            $stmt = $pdo->prepare('
                UPDATE property_blocks SET ' . implode(', ', $updates) . '
                WHERE id = ?
            ');
            $stmt->execute($params);

            $stmt = $pdo->prepare('
                SELECT id, property_id, start_date, end_date, block_type, source_reference, notes, created_at, updated_at
                FROM property_blocks WHERE id = ?
            ');
            $stmt->execute([$id]);
            $block = $stmt->fetch(\PDO::FETCH_ASSOC);

            Response::success($block, 'Block updated');
        } catch (\Exception $e) {
            Response::error('Failed to update block', [$e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/availability/delete_block?id=1
     */
    public function deleteBlock(): void
    {
        try {
            $id = Request::getQueryParam('id');

            if (!$id) {
                Response::error('Block id is required');
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare("DELETE FROM property_blocks WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                Response::error('Block not found', null, 404);
                return;
            }

            Response::success(null, 'Block deleted');
        } catch (\Exception $e) {
            Response::error('Failed to delete block', [$e->getMessage()], 500);
        }
    }

    /**
     * POST /api/availability/save_ical
     * Body: property_id, provider, ical_url
     */
    public function saveIcal(): void
    {
        try {
            $body = Request::getBody();
            $propertyId = $body['property_id'] ?? null;
            $provider = $body['provider'] ?? null;
            $icalUrl = $body['ical_url'] ?? null;

            if (!$propertyId || !$provider || !$icalUrl) {
                Response::error('Missing required fields: property_id, provider, ical_url');
                return;
            }

            if (!in_array($provider, ['airbnb', 'booking', 'vrbo'], true)) {
                Response::error('provider must be airbnb, booking, or vrbo');
                return;
            }

            if (!filter_var($icalUrl, FILTER_VALIDATE_URL)) {
                Response::error('ical_url must be a valid URL');
                return;
            }

            $pdo = Connection::getInstance();

            $stmt = $pdo->prepare('SELECT id FROM properties WHERE id = ?');
            $stmt->execute([$propertyId]);
            if (!$stmt->fetch(\PDO::FETCH_ASSOC)) {
                Response::error('Property not found', null, 404);
                return;
            }

            $stmt = $pdo->prepare('
                INSERT INTO property_ical_sources (property_id, provider, ical_url)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE ical_url = VALUES(ical_url), updated_at = NOW()
            ');
            $stmt->execute([$propertyId, $provider, $icalUrl]);

            $stmt = $pdo->prepare('
                SELECT id, property_id, provider, ical_url, last_sync_at, created_at, updated_at
                FROM property_ical_sources WHERE property_id = ? AND provider = ?
            ');
            $stmt->execute([$propertyId, $provider]);
            $source = $stmt->fetch(\PDO::FETCH_ASSOC);

            Response::success($source, 'iCal source saved');
        } catch (\Exception $e) {
            Response::error('Failed to save iCal source', [$e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/availability/delete_ical?id=1
     */
    public function deleteIcal(): void
    {
        try {
            $id = Request::getQueryParam('id');

            if (!$id) {
                Response::error('iCal source id is required');
                return;
            }

            $pdo = Connection::getInstance();

            $stmt = $pdo->prepare('SELECT id, property_id, provider FROM property_ical_sources WHERE id = ?');
            $stmt->execute([$id]);
            $deleted = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$deleted) {
                Response::error('iCal source not found', null, 404);
                return;
            }

            $stmt = $pdo->prepare('DELETE FROM property_ical_sources WHERE id = ?');
            $stmt->execute([$id]);

            $stmt = $pdo->prepare('
                DELETE FROM imported_calendar_events WHERE property_id = ? AND source_provider = ?
            ');
            $stmt->execute([$deleted['property_id'], $deleted['provider']]);

            Response::success(null, 'iCal source deleted');
        } catch (\Exception $e) {
            Response::error('Failed to delete iCal source', [$e->getMessage()], 500);
        }
    }

    /**
     * POST /api/availability/sync_airbnb
     * Body: property_id, provider
     * Fetches the saved iCal feed for the given property/provider and imports its events
     */
    public function syncAirbnb(): void
    {
        try {
            $body = Request::getBody();
            $propertyId = $body['property_id'] ?? null;
            $provider = $body['provider'] ?? null;

            if (!$propertyId || !$provider) {
                Response::error('Missing required fields: property_id, provider');
                return;
            }

            $pdo = Connection::getInstance();

            $stmt = $pdo->prepare('
                SELECT id, ical_url FROM property_ical_sources WHERE property_id = ? AND provider = ?
            ');
            $stmt->execute([$propertyId, $provider]);
            $source = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$source) {
                Response::error('No iCal source configured for this provider', null, 404);
                return;
            }

            $icalText = $this->fetchIcalFeed($source['ical_url']);
            $events = $this->parseIcalEvents($icalText);

            $pdo->beginTransaction();
            try {
                foreach ($events as $event) {
                    $stmt = $pdo->prepare('
                        INSERT INTO imported_calendar_events
                            (property_id, external_uid, source_provider, start_date, end_date, summary, last_seen_at)
                        VALUES (?, ?, ?, ?, ?, ?, NOW())
                        ON DUPLICATE KEY UPDATE
                            start_date = VALUES(start_date),
                            end_date = VALUES(end_date),
                            summary = VALUES(summary),
                            last_seen_at = NOW()
                    ');
                    $stmt->execute([
                        $propertyId,
                        $event['uid'],
                        $provider,
                        $event['start_date'],
                        $event['end_date'],
                        $event['summary'],
                    ]);
                }

                $stmt = $pdo->prepare('UPDATE property_ical_sources SET last_sync_at = NOW(), updated_at = NOW() WHERE id = ?');
                $stmt->execute([$source['id']]);

                $pdo->commit();
            } catch (\Exception $e) {
                $pdo->rollBack();
                throw $e;
            }

            Response::success(['events_count' => count($events)], 'Calendar synced');
        } catch (\Exception $e) {
            Response::error('Failed to sync calendar', [$e->getMessage()], 500);
        }
    }

    /**
     * Fetches the raw iCal feed contents over HTTPS with a short timeout
     */
    private function fetchIcalFeed(string $url): string
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 15,
                'header' => "User-Agent: ModernVilla-Sync/1.0\r\n",
            ],
        ]);

        $contents = @file_get_contents($url, false, $context);

        if ($contents === false) {
            throw new \Exception('Unable to fetch iCal feed from provided URL');
        }

        return $contents;
    }

    /**
     * Parses VEVENT blocks out of raw iCal text into [uid, summary, start_date, end_date]
     */
    private function parseIcalEvents(string $icalText): array
    {
        $events = [];

        if (!preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $icalText, $blocks)) {
            return $events;
        }

        foreach ($blocks[1] as $block) {
            $uidMatch = preg_match('/UID:(.+)/', $block, $m) ? trim($m[1]) : null;
            $summaryMatch = preg_match('/SUMMARY:(.+)/', $block, $m) ? trim($m[1]) : 'Reserved';
            $startMatch = preg_match('/DTSTART(?:;[^:]*)?:(\d{8})/', $block, $m) ? $m[1] : null;
            $endMatch = preg_match('/DTEND(?:;[^:]*)?:(\d{8})/', $block, $m) ? $m[1] : null;

            if (!$uidMatch || !$startMatch || !$endMatch) {
                continue;
            }

            $events[] = [
                'uid' => $uidMatch,
                'summary' => $summaryMatch,
                'start_date' => substr($startMatch, 0, 4) . '-' . substr($startMatch, 4, 2) . '-' . substr($startMatch, 6, 2),
                'end_date' => substr($endMatch, 0, 4) . '-' . substr($endMatch, 4, 2) . '-' . substr($endMatch, 6, 2),
            ];
        }

        return $events;
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
            ');
            $stmt->execute([$property, $blockedDate, $reason]);
            $newId = $pdo->lastInsertId();

            $stmt = $pdo->prepare('SELECT id, property_name, blocked_date, reason, created_at FROM blocked_dates WHERE id = ?');
            $stmt->execute([$newId]);
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
