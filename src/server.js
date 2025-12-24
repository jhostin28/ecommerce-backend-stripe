// ==============================
// IMPORTS
// ==============================

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Rutas
import userRoutes from './routes/users.routes.js';
import productRoutes from './routes/products.routes.js';
import orderRoutes from './routes/orders.routes.js';
import paymentRoutes from './routes/payments.routes.js';
import webhookRoutes from './routes/webhooks.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

// ==============================
// APP INIT
// ==============================

const app = express();

// CORS
app.use(cors());

// ⬇️ RUTAS DE WEBHOOK (RAW BODY VA ADENTRO DE LA RUTA)
app.use('/webhooks', webhookRoutes);

// JSON NORMAL (REST)
app.use(express.json());

// REST ROUTES
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/admin', adminRoutes);

// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
