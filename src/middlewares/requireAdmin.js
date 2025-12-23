// Middleware que valida que el usuario tenga rol ADMIN
// Se ejecuta DESPUÉS del authMiddleware
export default function requireAdmin(req, res, next) {

  // Si no hay usuario en la request, no está autenticado
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Si el usuario no es ADMIN, bloqueamos acceso
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // Si es ADMIN, continuamos
  next();
}
