// ==============================
// IMPORTS
// ==============================

import prisma from "../prisma.js";

// ==============================
// GET ALL ORDERS (ADMIN)
// ==============================

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
        createdAt: "desc",
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error("ADMIN GET ALL ORDERS ERROR:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// ==============================
// GET ORDER BY ID (ADMIN)
// ==============================

export async function getOrderByIdAdmin(req, res) {
  try {
    // 1️⃣ ID desde la URL
    const orderId = Number(req.params.id);

    // 2️⃣ Buscar la orden
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          select: { email: true },
        },
        items: true,
        payment: true,
      },

    });

    // 3️⃣ Si no existe
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    return res.json(order);
  } catch (error) {
    console.error("ADMIN GET ORDER DETAIL ERROR:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// ==============================
// UPDATE ORDER STATUS (ADMIN)
// ==============================

export async function updateOrderStatusAdmin(req, res) {
  try {
    // 1️⃣ Leer ID de la URL
    const orderId = Number(req.params.id);

    // 2️⃣ Leer nuevo estado del body
    const { status } = req.body;

    // 3️⃣ Validar ID
    if (!orderId) {
      return res.status(400).json({ message: "ID inválido" });
    }

    // 4️⃣ Validar estado permitido
    const allowedStatuses = ["PAID", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Estado inválido. Solo se permite PAID o CANCELLED",
      });
    }

    // 5️⃣ Buscar orden actual (incluimos payment)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // 6️⃣ Validar transición
    if (order.status !== "PENDING") {
      return res.status(400).json({
        message: `No se puede cambiar una orden en estado ${order.status}`,
      });
    }

    // 6.1️⃣ BLOQUEO ABSOLUTO: Stripe ya cobró
    if (order.payment && order.payment.status === "SUCCESS") {
      return res.status(400).json({
        message: "No se puede cancelar una orden que ya fue pagada en Stripe",
      });
    }


   // 7️⃣ Actualizar estado
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
      },
    });

// 8️⃣ Responder
return res.json(updatedOrder);


  } catch (error) {
    console.error("ADMIN UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

