<?php

namespace App\Helpers;

class Uuid
{
    /**
     * Generates a random (v4) UUID string. MySQL has no built-in column
     * default equivalent to Postgres's gen_random_uuid(), so primary keys
     * that used to rely on that (reservations.id, admin_users.id) are
     * generated here in the app before INSERT.
     */
    public static function v4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40); // version 4
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80); // variant 10

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
