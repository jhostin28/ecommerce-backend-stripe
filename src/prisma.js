// Importamos Prisma Client usando ES Modules
import { PrismaClient } from '@prisma/client';

// Creamos una única instancia de Prisma
const prisma = new PrismaClient();

// Exportamos la instancia para usarla en controllers
export default prisma;
