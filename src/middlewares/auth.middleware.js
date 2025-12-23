// Middleware de autenticación JWT
// 1. Lee el token del header Authorization
// 2. Verifica el token
// 3. Adjunta el payload decodificado a req.user

import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  try {
    // Obtenemos el header Authorization
    const authHeader = req.headers.authorization;

    // Si no hay header, no hay token
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // El formato esperado es: Bearer TOKEN
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // ✅ AQUÍ ESTABA EL ERROR: esta línea faltaba
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 DEBUG (puedes borrarlo luego)
    console.log("JWT DECODED EN authMiddleware 👉", decoded);

    // Guardamos el usuario decodificado en la request
    req.user = decoded;

    // Continuamos con la request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
