// Importamos Express
const express = require("express")

// Creamos el router
const router = express.Router()

// Importamos el controller de users
const usersController = require("../controllers/users.controller")

// POST /users/register → registrar usuario
router.post("/register", usersController.registerUser)

// POST /users/login → login de usuario
router.post("/login", usersController.loginUser)

// Exportamos las rutas
module.exports = router
