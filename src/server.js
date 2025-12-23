// ==============================
// IMPORTS
// ==============================

// Importamos Express usando ES Modules
import express from 'express';

// Importamos dotenv para variables de entorno
import dotenv from 'dotenv';

// Importamos las rutas del sistema
import userRoutes from './routes/users.routes.js';
import productRoutes from './routes/products.routes.js';
import orderRoutes from './routes/orders.routes.js';
import paymentRoutes from './routes/payments.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Cargamos variables de entorno
dotenv.config();

// ==============================
// APP CONFIG
// ==============================

// Creamos la app de Express
const app = express();

/**
 * 🔴 STRIPE WEBHOOK RAW BODY
 * IMPORTANTE:
 * - Stripe necesita el body SIN parsear
 * - DEBE ir ANTES de express.json()
 * - SOLO se aplica a /webhooks/stripe
 */
app.use(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' })
);

// Middleware para leer JSON (REST normal)
app.use(express.json());

// ==============================
// ROUTES
// ==============================

// Rutas públicas / protegidas
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/webhooks', webhookRoutes);

// Rutas ADMIN
app.use('/admin', adminRoutes);

// ==============================
// SERVER START
// ==============================

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Levantamos el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
