// Importamos Express
const express = require("express")

// Creamos el router
const router = express.Router()

// Importamos el controller de productos
const productsController = require("../controllers/products.controller")

// Importamos el middleware de autenticación
const authMiddleware = require("../middlewares/auth.middleware")

// Obtener todos los productos
router.get("/", productsController.getAllProducts)

// Crear un producto
router.post("/", productsController.createProduct)

// Editar un producto por ID
router.put("/:id", productsController.updateProduct)

// 🔐 Eliminar producto (ruta protegida)
router.delete("/:id", authMiddleware, productsController.deleteProduct)

// Exportamos las rutas (SIEMPRE AL FINAL)
module.exports = router
