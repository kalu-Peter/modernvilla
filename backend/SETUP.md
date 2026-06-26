# PHP Backend Setup Guide

## Quick Start

### 1. Requirements

- PHP 8.1 or higher
- MySQL 8.0+ or MariaDB 10.2+
- Composer (optional, for dependency management)

### 2. Setup Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Database

Run the SQL schema in `schema.sql` against your MySQL database to create tables:

```bash
mysql -u root -p shelter < schema.sql
```

### 4. Start Development Server

```bash
# Using PHP built-in server
php -S localhost:4000 -t public

# Or using Docker
docker-compose up

# Or with Composer script
composer start
```

### 5. Test the API

```bash
curl http://localhost:4000/api/properties
```

## Project Structure

```
backend/
├── public/
│   ├── index.php          # Main API entry point
│   └── autoload.php       # PSR-4 autoloader
├── src/
│   ├── Config/            # Configuration classes
│   │   └── Config.php
│   ├── Controllers/       # API endpoint handlers
│   │   ├── AdminController.php
│   │   ├── AvailabilityController.php
│   │   ├── PaymentController.php
│   │   ├── PricingController.php
│   │   ├── PropertiesController.php
│   │   └── ReservationsController.php
│   ├── Database/          # Database connection
│   │   └── Connection.php
│   ├── Helpers/           # Utility functions
│   │   ├── Response.php   # Standardized responses
│   │   └── Request.php    # Request handling
│   └── Middleware/        # Request middleware
│       └── AdminAuth.php  # Admin authentication
├── routes.php             # Route definitions
├── composer.json          # PHP dependencies
├── docker-compose.yml     # Docker setup
└── schema.sql             # Database schema
```

## API Endpoints

### Public Endpoints

**Get Properties**

```
GET /api/properties
```

**Check Availability**

```
GET /api/availability?property=Shelter%20A&checkin=2024-01-15&checkout=2024-01-20
```

**Create Reservation**

```
POST /api/reservations
Content-Type: application/json

{
  "property_name": "Shelter A",
  "guests": 4,
  "checkin": "2024-01-15",
  "checkout": "2024-01-20",
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "total_price": 120000
}
```

**Get Seasonal Pricing**

```
GET /api/seasonal-price
GET /api/seasonal-price?shelterId=shelter-a
```

### Payment Endpoints

**Create Payment**

```
POST /api/payments/create
Content-Type: application/json

{
  "reservation_id": "uuid",
  "amount": 120000,
  "phone_number": "+1234567890"
}
```

**Payment Callback**

```
POST /api/payments/callback
Content-Type: application/json
```

### Admin Endpoints (Require x-admin-secret header)

**Admin Login**

```
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Update Reservation**

```
PUT /api/admin/reservations
Content-Type: application/json
x-admin-secret: your_secret_here

{
  "id": "uuid",
  "payment_status": "paid",
  "confirmed": true
}
```

**Update Seasonal Pricing**

```
PUT /api/admin/seasonal-pricing
Content-Type: application/json
x-admin-secret: your_secret_here

{
  "shelter_id": "shelter-a",
  "start_date": "2024-03-01",
  "end_date": "2024-03-31",
  "price_per_night": 8000,
  "label": "High Season"
}
```

**Remove Blocked Date**

```
DELETE /api/admin/blocked-dates/:id
x-admin-secret: your_secret_here
```

## Response Format

All responses follow this format:

### Success

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## Development Notes

- All errors are logged and returned with appropriate HTTP status codes
- CORS is enabled for the frontend URL specified in .env
- Rate limiting: 100 requests per 15 minutes on `/api/`
- Admin endpoints require the `x-admin-secret` header
- All date handling uses ISO 8601 format (YYYY-MM-DD)

## Next Steps

1. ✅ Basic structure created
2. ⏳ Implement payment provider integration (M-Pesa, Stripe, etc.)
3. ⏳ Add comprehensive error handling
4. ⏳ Add request validation
5. ⏳ Add logging system
6. ⏳ Add API documentation (Swagger/OpenAPI)
7. ⏳ Add unit tests
8. ⏳ Deploy to production server
