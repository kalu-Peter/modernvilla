import { Router } from "express";
import { initiatePesapal, checkPesapalStatus, handleIPN, registerIPNEndpoint } from "../controllers/paymentController.js";

const router = Router();

// IPN callback from PesaPal (GET)
router.get("/", handleIPN);

// One-off: register IPN URL and get ipn_id
router.post("/register-ipn", registerIPNEndpoint);

// Single POST endpoint routed by action field
router.post("/", async (req, res) => {
  const { action } = req.body ?? {};
  if (action === "pesapal-initiate") return initiatePesapal(req, res);
  if (action === "pesapal-status")   return checkPesapalStatus(req, res);
  return res.status(400).json({ error: "Invalid action. Use: pesapal-initiate, pesapal-status" });
});

export default router;
