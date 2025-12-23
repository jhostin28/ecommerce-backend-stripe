// Importamos la instancia de Prisma
import prisma from '../prisma.js';


export async function getAllOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
}
