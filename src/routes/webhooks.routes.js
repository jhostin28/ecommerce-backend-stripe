// Log para confirmar que el archivo se carga correctamente
console.log("✅ webhooks.routes.js cargado");

// Express
import express from "express";

// ✅ IMPORT DEFAULT (CLAVE)
import webhooksController from "../controllers/webhooks.controller.js";

// Router
const router = express.Router();

// ⚠️ NO uses express.raw aquí
// Ya lo manejas en server.js
router.post("/stripe", webhooksController.handleStripeWebhook);

// Export
export default router;
