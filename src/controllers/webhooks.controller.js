// Importamos Stripe usando ES Modules
import Stripe from 'stripe';

// Inicializamos Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Importamos Prisma
import prisma from '../prisma.js';

/**
 * Webhook de Stripe
 * Stripe llamará a esta función cuando ocurra un evento de pago
 */
export async function stripeWebhook(req, res) {
  // Stripe envía la firma en este header
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    /**
     * 🔐 Verificamos que el evento:
     * - viene realmente de Stripe
     * - no fue modificado
     *
     * IMPORTANTE:
     * - req.body debe ser RAW (por eso express.raw en server.js)
     */
    event = stripe.webhooks.constructEvent(
      req.body, // RAW BODY
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error.message);
    return res.status(400).send('Webhook Error');
  }

  // ==============================
  // 🔥 LOGS CRÍTICOS (DEBUG)
  // ==============================
  console.log('🔥 STRIPE EVENT TYPE:', event.type);
  console.log('🔥 STRIPE EVENT ID:', event.id);

  // ==============================
  // EVENTO: PAGO CONFIRMADO
  // ==============================
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // 🔥 ID DEL PAYMENT INTENT QUE ENVÍA STRIPE
    console.log('🔥 PAYMENT INTENT ID FROM STRIPE:', paymentIntent.id);

    // Buscamos el pago asociado en la base de datos
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    // 🔥 RESULTADO DE LA BÚSQUEDA EN BD
    console.log('🔥 PAYMENT FOUND IN DB:', payment);

    // Solo si el pago existe (idempotencia)
    if (payment) {
      // Actualizamos el pago a SUCCESS
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCESS' },
      });

      // Actualizamos la orden a PAID
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' },
      });

      console.log('✅ PAYMENT & ORDER UPDATED SUCCESSFULLY');
    } else {
      console.log('❌ PAYMENT NOT FOUND FOR THIS PAYMENT INTENT');
    }
  }

  /**
   * Stripe EXIGE una respuesta 200
   * Si no respondes, reintentará el webhook
   */
  res.json({ received: true });
}
