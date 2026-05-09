import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  login,
  listUsers,
  createUser,
  deleteUser,
  getAllReservations,
  updateReservation,
  blockDate,
  getBlockedDates,
  unblockDate,
  getAllPricing,
  updatePricing,
  getSeasonalPricing,
  createSeasonalPricing,
  updateSeasonalPricing,
  deleteSeasonalPricing,
} from "../controllers/adminController.js";

const router = Router();

// Public — no secret required
router.post("/login", login);

// All routes below require the secret header
router.use(adminAuth);

// User management
router.get("/users",        listUsers);
router.post("/users",       createUser);
router.delete("/users/:id", deleteUser);

// Reservations
router.get("/reservations",        getAllReservations);
router.put("/reservations/:id",    updateReservation);

// Blocked dates
router.get("/blocked-dates",       getBlockedDates);
router.post("/blocked-dates",      blockDate);
router.delete("/blocked-dates/:id", unblockDate);

// Pricing
router.get("/pricing",        getAllPricing);
router.put("/pricing/:id",    updatePricing);

// Seasonal Pricing
router.get("/seasonal-pricing",           getSeasonalPricing);
router.post("/seasonal-pricing",          createSeasonalPricing);
router.put("/seasonal-pricing/:id",       updateSeasonalPricing);
router.delete("/seasonal-pricing/:id",    deleteSeasonalPricing);

export default router;
