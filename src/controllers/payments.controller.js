// ==============================
// IMPORTS
// ==============================

// Importamos Stripe usando ES Modules
import Stripe from 'stripe';

// Inicializamos Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Importamos Prisma
import prisma from '../prisma.js';

// ==============================
// CREATE PAYMENT INTENT
// ==============================

async function createPaymentIntent(req, res) {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    console.log("🧪 ORDER ID RECIBIDO 👉", orderId);

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    // 1️ Buscar la orden
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Order is not payable" });
    }

    // 2️ BUSCAR SI YA EXISTE UN PAYMENT
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
      },
    });

    //  SI EXISTE → reutilizamos el PaymentIntent
    if (existingPayment) {
      console.log("🟡 Payment existente, reutilizando Stripe Intent");

      const intent = await stripe.paymentIntents.retrieve(
        existingPayment.stripePaymentIntentId
      );

      return res.json({
        clientSecret: intent.client_secret,
      });
    }

    // 3️ CREAR NUEVO PAYMENT INTENT
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        orderId: order.id,
      },
    });

    // 4️ GUARDAR EN DB
    await prisma.payment.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        amount: order.totalAmount,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("❌ PAYMENT ERROR 👉", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


// ==============================
// EXPORT
// ==============================

export default {
  createPaymentIntent,
};
