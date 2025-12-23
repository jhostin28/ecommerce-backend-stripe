// Log para confirmar que el archivo se carga correctamente
console.log("✅ users.routes.js cargado");

// Importamos Express usando ES Modules
import express from 'express';

// Importamos el controller de usuarios
import usersController from '../controllers/users.controller.js';

// Creamos el router de Express
const router = express.Router();

// POST /users/register
// Registra un nuevo usuario
router.post('/register', usersController.registerUser);

// POST /users/login
// Autentica un usuario y devuelve un JWT
router.post('/login', usersController.loginUser);

// Exportamos el router como default (CLAVE para ES Modules)
export default router;
