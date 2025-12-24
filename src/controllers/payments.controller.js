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
    // El usuario autenticado viene del JWT
    const userId = req.user.userId;

    // Recibimos el orderId desde el body
    const { orderId } = req.body;

    // Validación básica
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    // Buscamos la orden
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    // Validamos que la orden exista y sea del usuario
    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Solo se puede pagar una orden pendiente
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        error: 'Order is not payable',
      });
    }

    // ==============================
    // 🔒 PROTECCIÓN CONTRA PAGOS DUPLICADOS
    // ==============================

    // Buscamos si ya existe un pago para esta orden
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        status: {
          in: ['PENDING', 'SUCCESS'],
        },
      },
    });

    // Si ya existe, reutilizamos el PaymentIntent
    if (existingPayment) {
      console.log('🟡 PaymentIntent reutilizado');

      const existingIntent = await stripe.paymentIntents.retrieve(
        existingPayment.stripePaymentIntentId
      );

      return res.json({
        clientSecret: existingIntent.client_secret,
      });
    }

    // ==============================
    // 🆕 CREAR NUEVO PAYMENT INTENT
    // ==============================

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100), // Stripe usa centavos
      currency: 'usd',

      // SOLO tarjeta
      payment_method_types: ['card'],

      metadata: {
        orderId: order.id,
      },
    });

    // Guardamos el pago en la base de datos
    await prisma.payment.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        amount: order.totalAmount,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    // Devolvemos el clientSecret
    return res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ==============================
// EXPORT
// ==============================

export default {
  createPaymentIntent,
};
