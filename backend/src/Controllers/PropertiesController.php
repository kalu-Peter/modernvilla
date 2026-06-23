<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;

class PropertiesController
{
    public function getAll(): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->query('SELECT * FROM properties ORDER BY name');
            $properties = $stmt->fetchAll();

            Response::success($properties, 'Properties retrieved successfully');
        } catch (\Exception $e) {
            Response::error('Failed to retrieve properties', [$e->getMessage()], 500);
        }
    }

    public function getById(string $id): void
    {
        try {
            $pdo = Connection::getInstance();
            $stmt = $pdo->prepare('SELECT * FROM properties WHERE id = ?');
            $stmt->execute([$id]);
            $property = $stmt->fetch();

            if (!$property) {
                Response::error('Property not found', null, 404);
                return;
            }

            Response::success($property, 'Property retrieved successfully');
        } catch (\Exception $e) {
            Response::error('Failed to retrieve property', [$e->getMessage()], 500);
        }
    }
}
