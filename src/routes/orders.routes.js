// ==============================
// DEBUG: confirmar que el archivo carga
// ==============================
console.log("✅ orders.routes.js cargado");

// ==============================
// IMPORTS
// ==============================

// Express
import express from 'express';

// Controller de órdenes
import ordersController from '../controllers/orders.controller.js';

// Middleware JWT
import authMiddleware from '../middlewares/auth.middleware.js';

// ==============================
// ROUTER
// ==============================

const router = express.Router();

/**
 * ==============================
 * POST /orders
 * ==============================
 * - Crea una orden nueva
 * - Requiere usuario autenticado
 * - Devuelve la orden creada (CON ID)
 */
router.post(
  '/',
  authMiddleware,
  ordersController.createOrder
);

/**
 * ==============================
 * GET /orders
 * ==============================
 * - Devuelve las órdenes del usuario logueado
 */
router.get(
  '/',
  authMiddleware,
  ordersController.getMyOrders
);

// ==============================
// EXPORT
// ==============================

export default router;
