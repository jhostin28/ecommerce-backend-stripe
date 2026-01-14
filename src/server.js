// ==============================
// IMPORTS
// ==============================
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import userRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import orderQueryRoutes from "./routes/orderQuery.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import webhookRoutes from "./routes/webhooks.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();
const app = express();

// ==============================
// CORS
// ==============================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ==============================
// 🔴 STRIPE WEBHOOK (RAW BODY)
// ==============================
app.use(
  "/webhooks/stripe",
  express.raw({ type: "application/json" })
);

// ==============================
// JSON PARA EL RESTO
// ==============================
app.use(express.json());

// ==============================
// ROUTES
// ==============================
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/orders-query", orderQueryRoutes);
app.use("/payments", paymentRoutes);

// 🔴 Webhook
app.use("/webhooks", webhookRoutes);

// 🔵 Admin
app.use("/admin", adminRoutes);

// ==============================
// START SERVER
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
