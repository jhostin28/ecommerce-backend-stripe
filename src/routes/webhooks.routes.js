// Log para confirmar que el archivo se carga correctamente
console.log("✅ webhooks.routes.js cargado");

// Importamos Express
import express from 'express';

// Importamos el controller (EXPORT NOMBRADO)
import { stripeWebhook } from '../controllers/webhooks.controller.js';

// Creamos el router
const router = express.Router();

/**
 * Stripe llamará a esta ruta
 * POST /webhooks/stripe
 */
router.post('/stripe', stripeWebhook);

// Exportamos el router
export default router;
