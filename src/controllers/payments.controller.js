// ==============================
// IMPORTS
// ==============================

// SDK oficial de Stripe
import Stripe from "stripe";

// Cliente de Prisma para la BD
import prisma from "../prisma.js";

// Inicializamos Stripe con la clave secreta
// (solo debe usarse en el backend)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==============================
// CREATE PAYMENT INTENT (USER)
// ==============================

/**
 * Crea (o reutiliza) un PaymentIntent de Stripe
 * asociado a una orden del usuario autenticado.
 *
 * Flujo:
 * 1. Validar orderId
 * 2. Validar que la orden exista y sea del usuario
 * 3. Validar que esté en estado PENDING
 * 4. IDEMPOTENCIA REAL (1 pago por orden)
 * 5. Crear PaymentIntent en Stripe (solo si no existe)
 * 6. Guardar Payment en BD
 * 7. Retornar clientSecret al frontend
 */
export async function createPaymentIntent(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = Number(req.params.orderId);

    // ==============================
    // VALIDACIÓN BÁSICA
    // ==============================
    if (!orderId) {
      return res.status(400).json({
        error: "orderId inválido o faltante",
      });
    }

    // ==============================
    // BUSCAR ORDEN
    // ==============================
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    // Si la orden ya fue pagada → no se puede pagar otra vez
    if (order.status === "PAID") {
      return res.status(400).json({
        error: "Order already paid",
      });
    }

    // Solo órdenes PENDING pueden pagarse
    if (order.status !== "PENDING") {
      return res.status(400).json({
        error: "Order is not payable",
      });
    }

    // ==============================
    // IDEMPOTENCIA REAL (1 PAYMENT POR ORDEN)
    // ==============================
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    // Si ya existe un pago → reutilizamos el PaymentIntent
    if (existingPayment) {
      const intent = await stripe.paymentIntents.retrieve(
        existingPayment.stripePaymentIntentId
      );

      return res.json({
        clientSecret: intent.client_secret,
      });
    }

    // ==============================
    // CREAR PAYMENT INTENT EN STRIPE
    // ==============================
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: "usd",

      // Stripe.js maneja los métodos automáticamente
      metadata: {
        orderId,
        userId,
      },
    });

    // ==============================
    // GUARDAR PAYMENT EN BD
    // ==============================
    await prisma.payment.create({
      data: {
        orderId,
        amount: order.totalAmount,
        status: "PENDING",
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    // ==============================
    // MANEJO DE IDEMPOTENCIA (PRISMA)
    // ==============================
    // Si Stripe o React llaman dos veces, Prisma puede lanzar P2002
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("orderId")
    ) {
      // No es un error del sistema, solo pago duplicado evitado
      return res.status(200).json({
        message: "Payment already exists for this order",
      });
    }

    console.error("CREATE PAYMENT INTENT ERROR:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// ==============================
// EXPORT
// ==============================
export default {
  createPaymentIntent,
};
