<?php

namespace App\Helpers;

class Request
{
    private static ?array $body = null;
    private static array $query;

    public static function init(): void
    {
        self::$query = $_GET;

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (str_contains($contentType, 'application/json')) {
            self::$body = json_decode(file_get_contents('php://input'), true) ?? [];
        }
    }

    public static function getBody(): array
    {
        return self::$body ?? [];
    }

    public static function getQuery(): array
    {
        return self::$query;
    }

    public static function getQueryParam(string $key, mixed $default = null): mixed
    {
        return self::$query[$key] ?? $default;
    }

    public static function getBodyParam(string $key, mixed $default = null): mixed
    {
        return (self::$body ?? [])[$key] ?? $default;
    }

    public static function getMethod(): string
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    public static function getPath(): string
    {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        return rtrim($path, '/');
    }

    public static function getHeader(string $name): ?string
    {
        $name = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        return $_SERVER[$name] ?? null;
    }
}
