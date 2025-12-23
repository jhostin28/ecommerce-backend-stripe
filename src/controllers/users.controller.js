console.log("🔥 USERS CONTROLLER CORRECTO CARGADO");

// Importamos Prisma (ES Modules)
import prisma from '../prisma.js';

// Importamos bcrypt para hashear passwords
import bcrypt from 'bcrypt';

// Importamos jsonwebtoken para crear el JWT
import jwt from 'jsonwebtoken';

// Registro de usuario
async function registerUser(req, res) {
  try {
    // Extraemos datos del body
    const { email, password, address } = req.body;

    // Validaciones básicas
    if (!email || !password || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    // Verificamos si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
      });
    }

    // Hasheamos la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creamos el usuario en la BD
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        address,
      },
    });

    // Nunca devolvemos la contraseña
    return res.status(201).json({
      id: user.id,
      email: user.email,
      address: user.address,
      createdAt: user.createdAt,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Login de usuario
async function loginUser(req, res) {
  try {
    // Extraemos email y password
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Buscamos el usuario
    const user = await prisma.user.findUnique({
      where: { email },
      
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Comparamos password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Generamos el token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role, // importante para ADMIN
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("🔥 LOGIN EJECUTADO, ROLE =", user.role);

    return res.json({
      message: 'Login successful',
      token,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Exportamos TODO como default (CLAVE)
export default {
  registerUser,
  loginUser,
};
