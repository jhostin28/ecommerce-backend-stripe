console.log("🔥🔥🔥 ADMIN ROUTES FILE LOADED");


// ==============================
// IMPORTS
// ==============================

import express from 'express';

// Middlewares
import authMiddleware from '../middlewares/auth.middleware.js';
import requireAdmin from '../middlewares/requireAdmin.js';

// Controllers
import {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatusAdmin,
} from '../controllers/admin.controller.js';

// ==============================
// ROUTER
// ==============================

const router = express.Router();

/**
 * GET /admin/orders
 * Listado de órdenes (ADMIN)
 */
router.get('/orders', authMiddleware, requireAdmin, getAllOrders);

/**
 * GET /admin/orders/:id
 * Detalle de orden (ADMIN)
 */
router.get('/orders/:id', authMiddleware, requireAdmin, getOrderByIdAdmin);

/**
 * PATCH /admin/orders/:id/status
 * Cambiar estado de orden (ADMIN)
 */
router.patch(
  '/orders/:id/status',
  authMiddleware,
  requireAdmin,
  updateOrderStatusAdmin
);

// ==============================
// EXPORT
// ==============================

export default router;
