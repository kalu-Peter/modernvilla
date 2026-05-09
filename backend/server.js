import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";

import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Gzip compression ─────────────────────────────────────────
app.use(compression());

// ─── CORS ────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-admin-secret"],
  })
);

// ─── Body parsing ─────────────────────────────────────────────
app.use(express.json());

// ─── Rate limiting (basic DoS protection) ────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// ─── Cache headers ────────────────────────────────────────────
// Public read-only endpoints: cache for 60 seconds
app.use("/api/seasonal-price", (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  next();
});
app.use("/api/availability", (_req, res, next) => {
  res.set("Cache-Control", "public, max-age=30");
  next();
});
// Admin & mutations: never cache
app.use("/api/admin", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// ─── Routes ──────────────────────────────────────────────────
app.use("/api", publicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ─── 404 ─────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// ─── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Crocodile Villas API running on port ${PORT}`);
});
