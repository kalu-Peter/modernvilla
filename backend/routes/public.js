import { Router } from "express";
import { getProperties } from "../controllers/propertiesController.js";
import { getPricingForProperty, getSeasonalPriceForDate } from "../controllers/pricingController.js";
import { checkAvailability } from "../controllers/availabilityController.js";
import { createReservation } from "../controllers/reservationsController.js";
const router = Router();

// GET /api/properties
router.get("/properties", getProperties);

// GET /api/pricing/:property
router.get("/pricing/:property", getPricingForProperty);

// GET /api/seasonal-price?villaId=&checkin=
router.get("/seasonal-price", getSeasonalPriceForDate);

// GET /api/availability?property=&checkin=&checkout=
router.get("/availability", checkAvailability);

// POST /api/reservations
router.post("/reservations", createReservation);

export default router;
