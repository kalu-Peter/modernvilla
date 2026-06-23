<?php

namespace App\Middleware;

use App\Config\Config;
use App\Helpers\Response;

class AdminAuth
{
    public static function verify(): bool
    {
        $token = $this->getAdminToken();
        $expectedSecret = Config::get('ADMIN_SECRET');

        if (!$token || $token !== $expectedSecret) {
            Response::error('Unauthorized', null, 401);
            return false;
        }

        return true;
    }

    private static function getAdminToken(): ?string
    {
        // Check header: x-admin-secret
        $headers = getallheaders();
        return $headers['x-admin-secret'] ?? $_GET['admin_secret'] ?? null;
    }

    public static function isAdmin(): bool
    {
        $token = self::getAdminToken();
        $expectedSecret = Config::get('ADMIN_SECRET');
        return $token === $expectedSecret;
    }
}
