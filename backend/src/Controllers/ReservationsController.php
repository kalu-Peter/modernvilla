<?php

namespace App\Controllers;

use App\Config\Config;
use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;
use App\Helpers\Uuid;
use App\Middleware\AdminAuth;
use App\Services\Mailer;
use App\Services\SwiklyClient;

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

            $this->notifyAdminOfNewReservation($id, $body);

            Response::success(['reservation' => ['id' => $id]], 'Reservation created successfully', 201);
        } catch (\Exception $e) {
            Response::error('Failed to create reservation', [$e->getMessage()], 500);
        }
    }

    /**
     * Best-effort email to the admin so a new booking gets approved
     * promptly — failure here is logged by Mailer::send() and never
     * propagates, since losing this notification shouldn't fail the
     * reservation the guest is waiting on.
     */
    private function notifyAdminOfNewReservation(string $id, array $body): void
    {
        $adminEmail = Config::get('ADMIN_NOTIFICATION_EMAIL');
        if (!$adminEmail) {
            return;
        }

        $dashboardUrl = rtrim((string) Config::get('FRONTEND_URL', ''), '/') . '/admin/dashboard';
        $ref = strtoupper(substr($id, 0, 8));

        $html = '
            <h2>New booking request</h2>
            <p>A new reservation is awaiting your approval.</p>
            <table cellpadding="6" cellspacing="0">
                <tr><td><strong>Reference</strong></td><td>' . htmlspecialchars($ref) . '</td></tr>
                <tr><td><strong>Property</strong></td><td>' . htmlspecialchars((string) $body['property_name']) . '</td></tr>
                <tr><td><strong>Guest</strong></td><td>' . htmlspecialchars((string) $body['name']) . '</td></tr>
                <tr><td><strong>Dates</strong></td><td>' . htmlspecialchars((string) $body['checkin']) . ' to ' . htmlspecialchars((string) $body['checkout']) . '</td></tr>
                <tr><td><strong>Guests</strong></td><td>' . htmlspecialchars((string) $body['guests']) . '</td></tr>
                <tr><td><strong>Total price</strong></td><td>€' . htmlspecialchars((string) $body['total_price']) . '</td></tr>
                <tr><td><strong>Phone</strong></td><td>' . htmlspecialchars((string) $body['phone']) . '</td></tr>
                <tr><td><strong>Email</strong></td><td>' . htmlspecialchars((string) $body['email']) . '</td></tr>
            </table>
            <p><a href="' . htmlspecialchars($dashboardUrl) . '">Review and approve in the admin dashboard</a></p>
        ';

        Mailer::send($adminEmail, 'New booking request — ' . $body['property_name'], $html);
    }

    /**
     * GET /api/reservations/status?id=...
     * Public, minimal status check used by the post-payment redirect page —
     * deliberately returns only payment_status/confirmed, no guest PII.
     */
    public function getStatus(): void
    {
        try {
            $id = Request::getQueryParam('id');
            if (!$id) {
                Response::error('Reservation id is required', null, 400);
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('SELECT payment_status, confirmed, cancelled FROM reservations WHERE id = ?');
            $stmt->execute([$id]);
            $reservation = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$reservation) {
                Response::error('Reservation not found', null, 404);
                return;
            }

            Response::success([
                'payment_status' => $reservation['payment_status'],
                'confirmed' => (bool) $reservation['confirmed'],
                'cancelled' => (bool) $reservation['cancelled'],
            ]);
        } catch (\Exception $e) {
            Response::error('Failed to fetch reservation status', [$e->getMessage()], 500);
        }
    }

    /**
     * POST /api/admin/reservations/approve
     * Admin-only. Body: { id }
     * Marks the reservation confirmed and, if the property has a deposit
     * configured, creates a Swikly Deposit request and returns its checkout
     * link so the admin can send it to the guest themselves (WhatsApp etc.).
     */
    public function approve(): void
    {
        if (!AdminAuth::verify()) {
            return;
        }

        try {
            $body = Request::getBody();
            $id = $body['id'] ?? null;

            if (!$id) {
                Response::error('Reservation id is required', null, 400);
                return;
            }

            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('
                SELECT id, property_id, property_name, checkin, checkout, name, phone, email,
                       confirmed, cancelled, swikly_link
                FROM reservations WHERE id = ?
            ');
            $stmt->execute([$id]);
            $reservation = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$reservation) {
                Response::error('Reservation not found', null, 404);
                return;
            }

            if ($reservation['cancelled']) {
                Response::error('Cannot approve a cancelled reservation', null, 409);
                return;
            }

            // Already approved — return the existing link instead of
            // creating a duplicate Swikly deposit request.
            if ($reservation['confirmed']) {
                Response::success([
                    'link' => $reservation['swikly_link'],
                    'name' => $reservation['name'],
                    'phone' => $reservation['phone'],
                ], 'Already approved');
                return;
            }

            $depositAmount = 0.0;
            if ($reservation['property_id']) {
                $depStmt = $pdo->prepare('SELECT deposit_amount FROM property_pricing WHERE property_id = ?');
                $depStmt->execute([$reservation['property_id']]);
                $depositAmount = (float) ($depStmt->fetchColumn() ?: 0);
            }

            $link = null;
            $requestId = null;

            if ($depositAmount > 0) {
                $swikly = SwiklyClient::fromConfig();
                if (!$swikly) {
                    Response::error('Payment provider is not configured', null, 500);
                    return;
                }

                [$firstName, $lastName] = SwiklyClient::splitName($reservation['name']);

                // startDate/endDate must be today or later — clamp in case
                // checkin has already passed by approval time.
                $today = date('Y-m-d');
                $startDate = max($reservation['checkin'], $today);
                $endDate = $reservation['checkout'] > $startDate
                    ? $reservation['checkout']
                    : date('Y-m-d', strtotime($startDate . ' +1 day'));

                $payload = [
                    'description' => 'Alsace Hideaways — Security deposit (' . $reservation['property_name'] . ')',
                    'language' => 'fr',
                    'customId' => $reservation['id'],
                    'customIdMustBeUnique' => true,
                    'firstName' => $firstName,
                    'lastName' => $lastName,
                    'email' => $reservation['email'],
                    'phoneNumber' => $reservation['phone'],
                    'skipToPaymentPageIfPossible' => true,
                    'deposit' => [
                        'startDate' => $startDate,
                        'endDate' => $endDate,
                        'amount' => (int) round($depositAmount * 100),
                    ],
                ];

                $frontendUrl = rtrim((string) Config::get('FRONTEND_URL', ''), '/');
                if ($frontendUrl) {
                    $payload['redirectUrl'] = $frontendUrl . '/payment-callback?reservation=' . $reservation['id'];
                    $payload['callbacks'] = [
                        'requestSecured' => $frontendUrl . '/api/payments/callback',
                    ];
                }

                [$status, $result] = $swikly->request('POST', '/accounts/' . $swikly->accountId() . '/requests', $payload);

                if ($status < 200 || $status >= 300 || !isset($result['request']['link'])) {
                    Response::error('Failed to create deposit request', [$result['message'] ?? 'Unknown error'], 502);
                    return;
                }

                $link = $result['request']['link'];
                $requestId = $result['request']['id'] ?? null;
            }

            $updateStmt = $pdo->prepare('
                UPDATE reservations SET confirmed = true, swikly_request_id = ?, swikly_link = ? WHERE id = ?
            ');
            $updateStmt->execute([$requestId, $link, $id]);

            Response::success([
                'link' => $link,
                'name' => $reservation['name'],
                'phone' => $reservation['phone'],
            ], 'Reservation approved');
        } catch (\Exception $e) {
            Response::error('Failed to approve reservation', [$e->getMessage()], 500);
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
            $stmt = $pdo->query('SELECT id, property_name, property_id, guests, checkin, checkout, name, phone, email, total_price, payment_status, confirmed, cancelled, swikly_request_id, swikly_link, created_at FROM reservations ORDER BY checkin DESC');
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
