// Importamos Prisma (ES Modules)
import prisma from '../prisma.js';

// Importamos Prisma Decimal
import { Prisma } from '@prisma/client';

// Crear una orden
async function createOrder(req, res) {
  try {
    // Usuario desde el JWT
    const userId = req.user.userId;

    const { items, shippingAddress } = req.body;

    // Validaciones básicas
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have items' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    // Usamos Decimal desde el inicio
    let totalAmount = new Prisma.Decimal(0);

    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({
          error: `Product ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for ${product.name}`,
        });
      }

      // total += price * quantity (Decimal seguro)
      const itemTotal = product.price.mul(item.quantity);
      totalAmount = totalAmount.add(itemTotal);

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    // Crear la orden
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalAmount,
        shippingAddress,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return res.status(201).json(order);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Ver mis órdenes
async function getMyOrders(req, res) {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
        payment: true,
      },
    });

    return res.json(orders);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ⬅️ EXPORT DEFAULT (CLAVE)
export default {
  createOrder,
  getMyOrders,
};
