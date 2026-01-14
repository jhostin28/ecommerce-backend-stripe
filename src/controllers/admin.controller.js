// ==============================
// IMPORTS
// ==============================

import prisma from "../prisma.js";
import { canTransitionOrder } from "../utils/orderStatusValidator.js";

// ==============================
// GET ALL ORDERS (ADMIN)
// ==============================

/**
 * Obtiene todas las órdenes del sistema
 * Solo accesible por ADMIN
 */
export async function getAllOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
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

/**
 * Obtiene el detalle de una orden específica
 * Incluye usuario, items y pago
 */
export async function getOrderByIdAdmin(req, res) {
  try {
    const orderId = Number(req.params.id);

    // Validación básica del ID
    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true } },
        items: true,
        payment: true,
      },
    });

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

/**
 * Permite al ADMIN cancelar una orden
 *
 * Reglas de negocio:
 * - El ADMIN solo puede cancelar (CANCELLED)
 * - El estado PAID solo lo establece el webhook de Stripe
 * - PAID y CANCELLED son estados finales
 */
export async function updateOrderStatusAdmin(req, res) {
  try {
    // 1️⃣ Leer y validar ID
    const orderId = Number(req.params.id);

    if (Number.isNaN(orderId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    // 2️⃣ Leer nuevo estado
    const { status: nextStatus } = req.body;

    /**
     * 🔒 Regla CLAVE:
     * El administrador NO puede marcar PAID.
     * Solo se permite CANCELLED.
     */
    if (nextStatus !== "CANCELLED") {
      return res.status(400).json({
        message: "El administrador solo puede cancelar órdenes",
      });
    }

    // 3️⃣ Buscar la orden actual
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    /**
     * 🔒 Estados finales
     * Una orden PAID o CANCELLED no puede modificarse jamás
     */
    if (order.status === "PAID" || order.status === "CANCELLED") {
      return res.status(400).json({
        message: `La orden está en estado final (${order.status}) y no puede modificarse`,
      });
    }

    /**
     * 4️⃣ Validar transición usando la regla centralizada
     * (defensa en capas)
     */
    if (!canTransitionOrder(order.status, nextStatus)) {
      return res.status(400).json({
        message: `Transición inválida: ${order.status} → ${nextStatus}`,
      });
    }

    /**
     * 5️⃣ Bloqueo absoluto si Stripe ya confirmó el pago
     * El webhook es la autoridad final
     */
    if (order.payment && order.payment.status === "SUCCEEDED") {
      return res.status(400).json({
        message: "No se puede cancelar una orden ya pagada",
      });
    }

    // 6️⃣ Actualizar estado a CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });

    return res.json(updatedOrder);
  } catch (error) {
    console.error("ADMIN UPDATE ORDER STATUS ERROR:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
