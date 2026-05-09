# Crocodile Villas – Backend API

Node.js · Express · Supabase (PostgreSQL)

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your Supabase credentials
```

### Database
Run `schema.sql` in the **Supabase SQL editor** (Dashboard → SQL Editor → New query).

### Start
```bash
npm run dev   # development (nodemon)
npm start     # production
```

---

## Environment variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your project URL from Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (keep secret – never expose to frontend) |
| `ADMIN_SECRET` | Password for the admin panel |
| `PORT` | Server port (default `4000`) |
| `FRONTEND_URL` | Allowed CORS origin (default `http://localhost:5173`) |

---

## API Reference

### Public endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/properties` | List all properties |
| `GET` | `/api/pricing/:property` | Pricing tiers for a property |
| `GET` | `/api/availability?property=&checkin=&checkout=` | Check availability |
| `POST` | `/api/reservations` | Create a reservation |

#### POST /api/reservations – body
```json
{
  "property_name": "Blue Villa",
  "guests": 4,
  "checkin": "2026-04-10",
  "checkout": "2026-04-15",
  "name": "Jane Doe",
  "phone": "+254712345678",
  "email": "jane@example.com",
  "total_price": 120000
}
```

---

### Admin endpoints
All admin routes require the header: `x-admin-secret: <ADMIN_SECRET>`

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/admin/reservations` | All reservations |
| `PUT` | `/api/admin/reservations/:id/confirm` | Confirm a reservation |
| `PUT` | `/api/admin/reservations/:id/cancel` | Cancel a reservation |
| `POST` | `/api/admin/block-date` | Block a date |
| `GET` | `/api/admin/blocked-dates` | List blocked dates |
| `DELETE` | `/api/admin/block-date/:id` | Unblock a date |
| `GET` | `/api/admin/pricing` | All pricing rows |
| `PUT` | `/api/admin/pricing/:id` | Update a price |

#### POST /api/admin/block-date – body
```json
{
  "property_name": "Gold Lodge",
  "blocked_date": "2026-04-20",
  "reason": "maintenance"
}
```

#### PUT /api/admin/pricing/:id – body
```json
{ "price": 7500 }
```
