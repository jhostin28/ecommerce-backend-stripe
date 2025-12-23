// Log para confirmar que el archivo se carga
console.log("✅ products.routes.js cargado");

// Importamos Express usando ES Modules
import express from 'express';

// Importamos el controller de productos
import productsController from '../controllers/products.controller.js';

// Importamos el middleware de autenticación JWT
import authMiddleware from '../middlewares/auth.middleware.js';

// Creamos el router de Express
const router = express.Router();

// GET /products
// Obtener todos los productos (público)
router.get('/', productsController.getAllProducts);

// POST /products
// Crear un producto (por ahora sin protección)
router.post('/', productsController.createProduct);

// PUT /products/:id
// Editar un producto por ID
router.put('/:id', productsController.updateProduct);

// DELETE /products/:id
// Elimina un producto (requiere autenticación)
router.delete(
  '/:id',
  authMiddleware,
  productsController.deleteProduct
);


// Exportamos el router como default (CLAVE)
export default router;
