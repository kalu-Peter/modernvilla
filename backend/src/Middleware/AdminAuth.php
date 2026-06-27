<?php

namespace App\Middleware;

use App\Config\Config;
use App\Helpers\Response;

class AdminAuth
{
    public static function verify(): bool
    {
        $token = self::getAdminToken();
        $expectedSecret = Config::get('ADMIN_SECRET');

        if (!$token || $token !== $expectedSecret) {
            Response::error('Unauthorized', null, 401);
            return false;
        }

        return true;
    }

    private static function getAdminToken(): ?string
    {
        // Check header: x-admin-secret. Matched case-insensitively — some
        // server stacks (e.g. LiteSpeed's PHP) title-case header names
        // (X-Admin-Secret) instead of preserving the lowercase the
        // frontend actually sends, which would silently break a literal
        // ['x-admin-secret'] lookup.
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp($name, 'x-admin-secret') === 0) {
                return $value;
            }
        }
        return $_GET['admin_secret'] ?? null;
    }

    public static function isAdmin(): bool
    {
        $token = self::getAdminToken();
        $expectedSecret = Config::get('ADMIN_SECRET');
        return $token === $expectedSecret;
    }
}
