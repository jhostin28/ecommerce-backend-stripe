// ==============================
// IMPORTS
// ==============================

// Express Router
import express from 'express';

// ✅ Middleware de autenticación (DEFAULT export)
// ⚠️ IMPORTANTE: sin llaves {}
import authMiddleware from '../middlewares/auth.middleware.js';

// Controlador de SOLO lectura de órdenes
import { getOrderById } from '../controllers/orderQuery.controller.js';

// ==============================
// ROUTER
// ==============================

const router = express.Router();

/**
 * GET /orders/:id
 *
 * Ruta protegida:
 * - Usuario logueado
 * - El controlador valida ownership o rol ADMIN
 */
router.get('/:id', authMiddleware, getOrderById);

// ==============================
// EXPORT
// ==============================

// Exportamos el router como default
export default router;
