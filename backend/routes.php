<?php

/**
 * API Routes Configuration
 */

return [
    // Public Routes
    'GET' => [
        '/api/properties' => 'PropertiesController@getAll',
        '/api/availability' => 'AvailabilityController@check',
        '/api/seasonal-price' => 'PricingController@getSeasonal',
        '/api/admin/auth' => 'AdminController@login',
        '/api/admin/reservations' => 'ReservationsController@update',
        '/api/admin/blocked-dates' => 'AvailabilityController@removeBlockedDate',
        '/api/admin/seasonal-pricing' => 'PricingController@updateSeasonal',
        '/api/pricing/calendar' => 'PricingCalendarController@getCalendar',
    ],

    'POST' => [
        '/api/reservations' => 'ReservationsController@create',
        '/api/payments/create' => 'PaymentController@create',
        '/api/payments/callback' => 'PaymentController@callback',
        '/api/admin/auth' => 'AdminController@login',
        '/api/admin/login' => 'AdminController@login',
        '/api/admin/blocked-dates' => 'AvailabilityController@removeBlockedDate',
        '/api/admin/seasonal-pricing' => 'PricingController@updateSeasonal',
        '/api/pricing/save_override' => 'PricingCalendarController@saveOverride',
        '/api/pricing/update_base' => 'PricingCalendarController@updateBasePricing',
    ],

    'PUT' => [
        '/api/admin/reservations' => 'ReservationsController@update',
        '/api/admin/blocked-dates' => 'AvailabilityController@removeBlockedDate',
        '/api/admin/seasonal-pricing' => 'PricingController@updateSeasonal',
    ],

    'DELETE' => [
        '/api/admin/auth' => 'AdminController@login',
        '/api/admin/reservations' => 'ReservationsController@update',
        '/api/admin/blocked-dates' => 'AvailabilityController@removeBlockedDate',
        '/api/admin/blocked-dates/:id' => 'AvailabilityController@removeBlockedDate',
        '/api/pricing/delete_override' => 'PricingCalendarController@deleteOverride',
    ],
];
