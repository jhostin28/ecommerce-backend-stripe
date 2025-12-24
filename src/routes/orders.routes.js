// Log para confirmar que el archivo se carga
console.log("✅ orders.routes.js cargado");

// Importamos Express usando ES Modules
import express from 'express';

// Importamos el controller de orders (ES Modules)
import ordersController from '../controllers/orders.controller.js';

// Importamos el middleware JWT (ES Modules)
import authMiddleware from '../middlewares/auth.middleware.js';

// Creamos el router de Express
const router = express.Router();

// POST /orders → crear orden (usuario autenticado)
router.post('/', authMiddleware, ordersController.createOrder);

// GET /orders → ver órdenes del usuario logueado
router.get('/', authMiddleware, ordersController.getMyOrders);

// Exportamos el router como default (CLAVE)
export default router;
