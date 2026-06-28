<?php

/**
 * API Routes Configuration
 */

return [
    // Public Routes
    'GET' => [
        '/api/properties' => 'PropertiesController@getAll',
        '/api/reservations/status' => 'ReservationsController@getStatus',
        '/api/availability' => 'AvailabilityController@check',
        '/api/availability/batch' => 'AvailabilityController@checkBatch',
        '/api/availability/calendar' => 'AvailabilityController@getCalendar',
        '/api/pricing/property' => 'PricingController@getPropertyPricing',
        '/api/pricing/calendar' => 'PricingCalendarController@getCalendar',
        '/api/admin/reservations' => 'ReservationsController@update',
        '/api/admin/revenue' => 'RevenueController@getSummary',
        '/api/admin/users' => 'AdminController@manageUsers',
    ],

    'POST' => [
        '/api/reservations' => 'ReservationsController@create',
        '/api/payments/callback' => 'PaymentController@callback',
        '/api/admin/auth' => 'AdminController@login',
        '/api/admin/login' => 'AdminController@login',
        '/api/admin/users' => 'AdminController@manageUsers',
        '/api/admin/reservations/approve' => 'ReservationsController@approve',
        '/api/pricing/save_override' => 'PricingCalendarController@saveOverride',
        '/api/pricing/update_base' => 'PricingCalendarController@updateBasePricing',
        '/api/availability/create_block' => 'AvailabilityController@createBlock',
        '/api/availability/update_block' => 'AvailabilityController@updateBlock',
        '/api/availability/save_ical' => 'AvailabilityController@saveIcal',
        '/api/availability/sync_airbnb' => 'AvailabilityController@syncAirbnb',
    ],

    'PUT' => [
        '/api/admin/reservations' => 'ReservationsController@update',
    ],

    'DELETE' => [
        '/api/admin/reservations' => 'ReservationsController@update',
        '/api/pricing/delete_override' => 'PricingCalendarController@deleteOverride',
        '/api/availability/delete_block' => 'AvailabilityController@deleteBlock',
        '/api/availability/delete_ical' => 'AvailabilityController@deleteIcal',
        '/api/admin/users' => 'AdminController@manageUsers',
    ],
];
