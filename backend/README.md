# Alsace Hideaways Backend - PHP API

Clean and modern PHP backend for the Alsace Hideaways booking system.

## Setup

1. Install PHP 8.1+
2. Install Composer
3. Copy `.env.example` to `.env` and configure
4. Install dependencies: `composer install`
5. Run migrations/setup schema in your database
6. Start development server: `php -S localhost:4000 -t public`

## Project Structure

```
backend/
├── public/
│   └── index.php          # API entry point
├── src/
│   ├── Config/            # Configuration classes
│   ├── Controllers/       # API controllers
│   ├── Database/          # Database connection & queries
│   ├── Middleware/        # Authentication & validation
│   └── Helpers/           # Utility functions
├── schema.sql             # Database schema
├── routes.php             # API route definitions
├── composer.json          # PHP dependencies
└── .env.example           # Environment variables template
```

## API Endpoints

### Public

- `GET /api/properties` - Get all properties
- `GET /api/availability` - Check availability
- `POST /api/reservations` - Create reservation
- `GET /api/seasonal-price` - Get seasonal pricing

### Payments

- `POST /api/payments/create` - Create payment
- `POST /api/payments/callback` - Payment callback

### Admin (requires authentication)

- `POST /api/admin/login` - Admin login
- `GET /api/admin/reservations` - Get reservations
- `PUT /api/admin/reservations/:id` - Update reservation
- `POST /api/admin/blocked-dates` - Add blocked date
- `PUT /api/admin/seasonal-pricing` - Update seasonal pricing
