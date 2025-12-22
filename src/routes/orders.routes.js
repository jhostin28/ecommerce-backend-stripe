console.log("✅ orders.routes.js cargado")

// Importamos Express
const express = require("express")

// Creamos router
const router = express.Router()

// Importamos el controller de orders
const ordersController = require("../controllers/orders.controller")

// Importamos middleware JWT
const authMiddleware = require("../middlewares/auth.middleware")

// POST /orders → crear orden (usuario autenticado)
router.post("/", authMiddleware, ordersController.createOrder)

// GET /orders → ver órdenes del usuario logueado
router.get("/", authMiddleware, ordersController.getMyOrders)

module.exports = router
