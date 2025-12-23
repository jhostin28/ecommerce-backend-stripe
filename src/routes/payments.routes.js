// Log para confirmar que el archivo se carga correctamente
console.log("✅ payments.routes.js cargado");

// Importamos Express usando ES Modules
import express from 'express';

// Importamos el controller de pagos
import paymentsController from '../controllers/payments.controller.js';

// Importamos el middleware de autenticación JWT
import authMiddleware from '../middlewares/auth.middleware.js';

// Creamos el router de Express
const router = express.Router();

// POST /payments/create-intent
// Crea un PaymentIntent en Stripe (usuario autenticado)
router.post(
  '/create-intent',
  authMiddleware,
  paymentsController.createPaymentIntent
);

// Exportamos el router como default (CLAVE para ES Modules)
export default router;
