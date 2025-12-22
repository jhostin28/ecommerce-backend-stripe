// Importamos Prisma
const prisma = require("../prisma")

// Importamos bcrypt para hashear passwords
const bcrypt = require("bcrypt")

// Registro de usuario
exports.registerUser = async (req, res) => {
  try {
    // Extraemos datos del body
    const { email, password, address } = req.body

    // 🔴 Validaciones básicas
    if (!email || !password || !address) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters"
      })
    }

    // 🔍 Verificamos si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists"
      })
    }

    // 🔐 Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // 🟢 Creamos el usuario en la BD
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        address
      }
    })

    // ❗ Nunca devolvemos la contraseña
    return res.status(201).json({
      id: user.id,
      email: user.email,
      address: user.address,
      createdAt: user.createdAt
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}


// Importamos jsonwebtoken arriba del archivo
const jwt = require("jsonwebtoken")

exports.loginUser = async (req, res) => {
  try {
    // Extraemos email y password
    const { email, password } = req.body

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      })
    }

    // Buscamos el usuario
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      })
    }

    // Comparamos password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid credentials"
      })
    }

    // 🔐 GENERAMOS EL TOKEN JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    )

    // ✅ RESPUESTA CORRECTA CON TOKEN
    return res.json({
      message: "Login successful",
      token
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}



