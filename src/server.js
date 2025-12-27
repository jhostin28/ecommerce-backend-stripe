// ==============================
// DEBUG: confirmar qué server está corriendo
// ==============================

console.log("🔥 SERVER RUNNING FROM:", import.meta.url);

// ==============================
// IMPORTS
// ==============================

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// ==============================
// ROUTES IMPORT
// ==============================

// Rutas públicas / usuario
import userRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import orderQueryRoutes from "./routes/orderQuery.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import webhookRoutes from "./routes/webhooks.routes.js";

// Rutas ADMIN
import adminRoutes from "./routes/admin.routes.js";

// ==============================
// CONFIG
// ==============================

dotenv.config();

const app = express();

// ==============================
// GLOBAL MIDDLEWARES
// ==============================

/**
 * ✅ CORS
 * Permitimos el frontend de Vite
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/**
 * 🔴 STRIPE WEBHOOK
 * DEBE ir antes de express.json()
 */
app.use(
  "/webhooks/stripe",
  express.raw({ type: "application/json" })
);

/**
 * JSON parser para el resto de rutas
 */
app.use(express.json());

// ==============================
// ROUTES (ORDEN CRÍTICO)
// ==============================

/**
 * 🟢 Rutas de autenticación y usuario
 */
app.use("/users", userRoutes);

/**
 * 🟢 Productos
 */
app.use("/products", productRoutes);

/**
 * 🟢 Órdenes del USUARIO (checkout, crear orden, etc.)
 */
app.use("/orders", orderRoutes);

/**
 * 🟢 Consultas específicas de órdenes (NO ADMIN)
 * ⚠️ IMPORTANTE:
 * NO usar el mismo prefijo "/orders" para evitar colisiones
 */
app.use("/orders-query", orderQueryRoutes);

/**
 * 🟢 Pagos
 */
app.use("/payments", paymentRoutes);

/**
 * 🟢 Webhooks
 */
app.use("/webhooks", webhookRoutes);

/**
 * 🔵 ADMIN (SIEMPRE separado)
 */
app.use("/admin", adminRoutes);

// ==============================
// SERVER START
// ==============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
