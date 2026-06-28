<?php

namespace App\Controllers;

use App\Config\Config;
use App\Database\Connection;
use App\Helpers\Response;
use App\Services\SwiklyClient;

class PaymentController
{
    /**
     * POST /api/payments/callback
     * Swikly's "requestSecured" webhook. Verifies the HMAC-SHA256 signature
     * before trusting the payload, then marks the matching reservation
     * (matched by customId = our reservation id) paid or failed. Fired for
     * both the Deposit requests created by ReservationsController::approve()
     * and any future Payment requests.
     */
    public function callback(): void
    {
        try {
            $rawBody = file_get_contents('php://input');
            $secret = Config::get('SWIKLY_SECRET');
            $signatureHeader = SwiklyClient::getSignatureHeader();

            if (!$secret || !$signatureHeader || !SwiklyClient::verifySignature($signatureHeader, $rawBody, $secret)) {
                Response::error('Invalid signature', null, 401);
                return;
            }

            $payload = json_decode($rawBody, true);
            $event = $payload['event'] ?? null;
            $requestData = $payload['request'] ?? null;
            $reservationId = $requestData['customId'] ?? null;

            if (!$reservationId) {
                Response::success(null, 'Ignored — no customId on request');
                return;
            }

            if ($event === 'requestSecured') {
                // Deposit and Payment operations use different status enums
                // (Deposit: Accepted/Released/Expired..., Payment: Succeeded...) —
                // "Released" is a later, separate lifecycle step (deposit handed
                // back after the stay) and intentionally left untouched here,
                // since the guest did secure it.
                $depositStatus = $requestData['deposit']['status'] ?? null;
                $paymentStatus = $requestData['payment']['status'] ?? null;
                $pdo = Connection::getInstance();

                $secured = $depositStatus === 'Accepted' || $paymentStatus === 'Succeeded';
                $failed = in_array($depositStatus, ['Failed', 'Canceled', 'Expired', 'ExpiredWithoutAcceptance'], true)
                    || in_array($paymentStatus, ['Failed', 'Canceled', 'ExpiredWithoutAcceptance'], true);

                if ($secured) {
                    $stmt = $pdo->prepare('UPDATE reservations SET payment_status = ? WHERE id = ?');
                    $stmt->execute(['paid', $reservationId]);
                } elseif ($failed) {
                    $stmt = $pdo->prepare('UPDATE reservations SET payment_status = ? WHERE id = ?');
                    $stmt->execute(['failed', $reservationId]);
                }
            }

            Response::success(null, 'Callback processed', 200);
        } catch (\Exception $e) {
            Response::error('Failed to process callback', [$e->getMessage()], 500);
        }
    }
}
