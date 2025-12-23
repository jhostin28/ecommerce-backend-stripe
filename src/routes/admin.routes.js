
// Importamos Express
import express from 'express';

// Middleware que valida el JWT (default export)
import authMiddleware from '../middlewares/auth.middleware.js';

// Middleware que valida que el usuario sea ADMIN (default export)
import requireAdmin from '../middlewares/requireAdmin.js';
console.log("🔥 ADMIN ROUTES CARGADO");
console.log("🔥 authMiddleware importado:", authMiddleware.toString());

// Controller de admin
import { getAllOrders } from '../controllers/admin.controller.js';

// Creamos el router de Express
const router = express.Router();

// Ruta: GET /admin/orders
// 1. authMiddleware -> valida token
// 2. requireAdmin  -> valida rol ADMIN
// 3. getAllOrders  -> lógica del endpoint
router.get('/orders', authMiddleware, requireAdmin, getAllOrders);

// Exportamos el router
export default router;
