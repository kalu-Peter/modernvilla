<?php

namespace App\Controllers;

use App\Database\Connection;
use App\Helpers\Response;
use App\Helpers\Request;

class RevenueController
{
    private const MONTH_LABELS = [
        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'May', 6 => 'Jun',
        7 => 'Jul', 8 => 'Aug', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec',
    ];

    /**
     * GET /api/admin/revenue?year=2026
     * Revenue is recognized from paid, non-cancelled reservations, grouped by checkin date.
     */
    public function getSummary(): void
    {
        try {
            $year = (int) (Request::getQueryParam('year') ?: date('Y'));

            $pdo = Connection::getInstance();

            $stmt = $pdo->prepare("
                SELECT EXTRACT(MONTH FROM checkin)::int AS month,
                       COALESCE(SUM(total_price), 0) AS revenue,
                       COUNT(*) AS bookings_count
                FROM reservations
                WHERE payment_status = 'paid' AND cancelled = false
                  AND EXTRACT(YEAR FROM checkin) = ?
                GROUP BY month
            ");
            $stmt->execute([$year]);
            $monthlyRows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $byMonth = [];
            foreach ($monthlyRows as $row) {
                $byMonth[(int) $row['month']] = $row;
            }

            $monthly = [];
            for ($m = 1; $m <= 12; $m++) {
                $row = $byMonth[$m] ?? null;
                $monthly[] = [
                    'month' => $m,
                    'label' => self::MONTH_LABELS[$m],
                    'revenue' => $row ? floatval($row['revenue']) : 0.0,
                    'bookings_count' => $row ? (int) $row['bookings_count'] : 0,
                ];
            }

            $stmt = $pdo->query("
                SELECT EXTRACT(YEAR FROM checkin)::int AS year,
                       COALESCE(SUM(total_price), 0) AS revenue,
                       COUNT(*) AS bookings_count
                FROM reservations
                WHERE payment_status = 'paid' AND cancelled = false
                GROUP BY year
                ORDER BY year
            ");
            $yearlyRows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $yearly = array_map(static fn($row) => [
                'year' => (int) $row['year'],
                'revenue' => floatval($row['revenue']),
                'bookings_count' => (int) $row['bookings_count'],
            ], $yearlyRows);

            $availableYears = array_map(static fn($row) => $row['year'], $yearly);
            if (!in_array($year, $availableYears, true)) {
                $availableYears[] = $year;
                sort($availableYears);
            }

            $stmt = $pdo->prepare("
                SELECT property_name,
                       COALESCE(SUM(total_price), 0) AS revenue,
                       COUNT(*) AS bookings_count
                FROM reservations
                WHERE payment_status = 'paid' AND cancelled = false
                  AND EXTRACT(YEAR FROM checkin) = ?
                GROUP BY property_name
                ORDER BY revenue DESC
            ");
            $stmt->execute([$year]);
            $byPropertyRows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            $byProperty = array_map(static fn($row) => [
                'property_name' => $row['property_name'],
                'revenue' => floatval($row['revenue']),
                'bookings_count' => (int) $row['bookings_count'],
            ], $byPropertyRows);

            $allTimeRevenue = array_sum(array_column($yearly, 'revenue'));
            $allTimeBookings = array_sum(array_column($yearly, 'bookings_count'));
            $currentYearData = array_values(array_filter($yearly, static fn($row) => $row['year'] === $year));

            Response::success([
                'year' => $year,
                'available_years' => $availableYears,
                'monthly' => $monthly,
                'yearly' => $yearly,
                'by_property' => $byProperty,
                'totals' => [
                    'all_time_revenue' => $allTimeRevenue,
                    'all_time_bookings' => $allTimeBookings,
                    'selected_year_revenue' => $currentYearData[0]['revenue'] ?? 0.0,
                    'selected_year_bookings' => $currentYearData[0]['bookings_count'] ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            Response::error('Failed to fetch revenue summary', [$e->getMessage()], 500);
        }
    }
}
