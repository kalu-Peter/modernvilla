<?php

namespace App\Services;

use App\Config\Config;

/**
 * Thin wrapper around Swikly's REST API (https://api.v2.swikly.com/v1),
 * shared between ReservationsController::approve() (creates a Deposit
 * request) and PaymentController::callback() (verifies/handles the
 * resulting "requestSecured" webhook).
 */
class SwiklyClient
{
    public function __construct(
        private string $apiKey,
        private string $accountId,
        private string $baseUrl,
    ) {
    }

    public static function fromConfig(): ?self
    {
        $apiKey = Config::get('SWIKLY_API_KEY');
        $accountId = Config::get('SWIKLY_ACCOUNT_ID');
        $baseUrl = Config::get('SWIKLY_BASE_URL', 'https://api.v2.swikly.com/v1');

        if (!$apiKey || !$accountId) {
            return null;
        }

        return new self((string) $apiKey, (string) $accountId, (string) $baseUrl);
    }

    public function accountId(): string
    {
        return $this->accountId;
    }

    /** @return array{0: int, 1: array|null} [HTTP status code, decoded JSON body] */
    public function request(string $method, string $path, ?array $body = null): array
    {
        $url = rtrim($this->baseUrl, '/') . $path;
        $jsonBody = $body !== null ? json_encode($body) : null;

        $context = stream_context_create([
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", [
                    'Authorization: Bearer ' . $this->apiKey,
                    'Accept: application/json',
                    'Content-Type: application/json',
                ]),
                'content' => $jsonBody,
                'timeout' => 20,
                'ignore_errors' => true,
            ],
        ]);

        $response = @file_get_contents($url, false, $context);
        $statusCode = 0;
        foreach ($http_response_header ?? [] as $headerLine) {
            if (preg_match('#^HTTP/\S+\s+(\d{3})#', $headerLine, $m)) {
                $statusCode = (int) $m[1];
            }
        }

        if ($response === false) {
            return [0, null];
        }

        $decoded = json_decode($response, true);
        return [$statusCode, is_array($decoded) ? $decoded : null];
    }

    /** Splits "Jane Doe" into ["Jane", "Doe"]; falls back sensibly for single-word names. */
    public static function splitName(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName), 2);
        $first = $parts[0] ?? '';
        $last = $parts[1] ?? $first;
        return [$first, $last];
    }

    public static function getSignatureHeader(): ?string
    {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'Swikly-Signature') === 0) {
                return $value;
            }
        }
        return null;
    }

    /**
     * Verifies "Swikly-Signature: t=<timestamp>,sha256=<hash>" against
     * HMAC-SHA256(secret, "<timestamp>.<rawBody>"), per Swikly's docs.
     */
    public static function verifySignature(string $header, string $rawBody, string $secret): bool
    {
        $parts = [];
        foreach (explode(',', $header) as $segment) {
            $pair = array_pad(explode('=', trim($segment), 2), 2, null);
            if ($pair[0] !== null) {
                $parts[$pair[0]] = $pair[1];
            }
        }

        $timestamp = $parts['t'] ?? null;
        $signature = $parts['sha256'] ?? null;
        if (!$timestamp || !$signature) {
            return false;
        }

        // Reject signatures older than 10 minutes to mitigate replay attacks.
        if (abs(time() - (int) $timestamp) > 600) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp . '.' . $rawBody, $secret);
        return hash_equals($expected, $signature);
    }
}
