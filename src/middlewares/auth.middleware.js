import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  console.log("🧪 HEADERS COMPLETOS 👉", req.headers);

  const authHeader = req.headers.authorization;

  console.log("🧪 AUTH HEADER 👉", authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🧪 JWT DECODED 👉", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ JWT ERROR 👉", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
