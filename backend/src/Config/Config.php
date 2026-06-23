<?php

namespace App\Config;

class Config
{
    private static array $config = [];

    public static function load(): void
    {
        // Load .env file
        $envPath = dirname(__DIR__, 2) . '/.env';
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    [$key, $value] = explode('=', $line, 2);
                    self::$config[trim($key)] = trim($value);
                }
            }
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return $_ENV[$key] ?? $default;
    }

    public static function isDevelopment(): bool
    {
        return self::get('ENVIRONMENT') === 'development';
    }

    public static function getSupabaseUrl(): string
    {
        return self::get('SUPABASE_URL', '');
    }

    public static function getSupabaseKey(): string
    {
        return self::get('SUPABASE_KEY', '');
    }

    public static function getFrontendUrl(): string
    {
        return self::get('FRONTEND_URL', 'http://localhost:5173');
    }

    public static function getAdminSecret(): string
    {
        return self::get('ADMIN_SECRET', '');
    }
}
