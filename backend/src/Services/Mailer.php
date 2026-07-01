<?php

namespace App\Services;

use App\Config\Config;
use PHPMailer\PHPMailer\PHPMailer;

/**
 * Thin wrapper around PHPMailer for sending notification emails (Gmail SMTP).
 * A failed send is logged and swallowed, never thrown — losing a
 * notification email must never break the reservation/approval flow that
 * triggered it.
 */
class Mailer
{
    public static function send(string $to, string $subject, string $htmlBody): bool
    {
        $host = Config::get('SMTP_HOST');
        $port = Config::get('SMTP_PORT', '587');
        $user = Config::get('SMTP_USER');
        $password = Config::get('SMTP_PASSWORD');

        if (!$host || !$user || !$password || !$to) {
            self::log('Not configured (missing SMTP_HOST/SMTP_USER/SMTP_PASSWORD or recipient) — skipped "' . $subject . '"');
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = $host;
            $mail->SMTPAuth = true;
            $mail->Username = $user;
            $mail->Password = $password;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = (int) $port;

            // Some hosts silently block/drop outbound SMTP ports instead of
            // refusing the connection outright — without a cap, that hang
            // can run past PHP's max_execution_time and kill the whole
            // request with an uncatchable fatal (no exception, no log,
            // and the reservation response never gets sent). Fail fast
            // instead so a blocked port degrades to a logged, swallowed
            // failure rather than taking the request down with it.
            $mail->Timeout = 10;
            $mail->SMTPKeepAlive = false;

            $mail->setFrom($user, 'Alsace Hideaways');
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->CharSet = PHPMailer::CHARSET_UTF8;
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;

            $mail->send();
            return true;
        } catch (\Throwable $e) {
            // Catch everything, not just PHPMailerException — a blocked
            // port or DNS failure can surface as a different throwable
            // depending on the underlying stream/socket error.
            self::log('Failed to send "' . $subject . '": ' . ($mail->ErrorInfo ?: $e->getMessage()));
            return false;
        }
    }

    private static function log(string $message): void
    {
        $logDir = dirname(__DIR__, 2) . '/logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        file_put_contents($logDir . '/error.log', date('Y-m-d H:i:s') . " - Mailer: $message\n", FILE_APPEND);
    }
}
