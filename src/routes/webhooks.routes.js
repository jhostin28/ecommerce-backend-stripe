console.log("✅ webhooks.routes.js cargado");

import express from "express";
import { stripeWebhook } from "../controllers/webhooks.controller.js";

const router = express.Router();

/**
 * POST /webhooks/stripe
 */
router.post("/stripe", stripeWebhook);

export default router;
