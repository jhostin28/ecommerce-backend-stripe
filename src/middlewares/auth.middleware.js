const jwt = require("jsonwebtoken")

// Middleware que verifica el token
module.exports = (req, res, next) => {
  try {
    // Leemos el header Authorization
    const authHeader = req.headers.authorization

    // Si no viene el header
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" })
    }

    // El formato es: "Bearer TOKEN"
    const token = authHeader.split(" ")[1]

    // Verificamos el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Guardamos el usuario en la request
    req.user = decoded

    // Continuamos a la ruta protegida
    next()

  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
