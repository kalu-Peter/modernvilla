<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Request;

class PaymentController
{
    public function create(): void
    {
        try {
            $body = Request::getBody();

            $required = ['reservation_id', 'amount', 'phone_number'];
            foreach ($required as $field) {
                if (empty($body[$field])) {
                    Response::error("Missing required field: $field");
                    return;
                }
            }

            // TODO: Integrate with payment provider (M-Pesa, Stripe, etc.)
            // For now, return a success response with payment details

            Response::success([
                'payment_id' => bin2hex(random_bytes(16)),
                'reservation_id' => $body['reservation_id'],
                'amount' => $body['amount'],
                'status' => 'pending',
                'created_at' => date('Y-m-d H:i:s')
            ], 'Payment initiated', 201);
        } catch (\Exception $e) {
            Response::error('Failed to create payment', [$e->getMessage()], 500);
        }
    }

    public function callback(): void
    {
        try {
            $body = Request::getBody();

            // TODO: Validate payment provider callback signature
            // TODO: Update reservation payment_status based on callback

            Response::success(null, 'Callback processed', 200);
        } catch (\Exception $e) {
            Response::error('Failed to process callback', [$e->getMessage()], 500);
        }
    }
}
