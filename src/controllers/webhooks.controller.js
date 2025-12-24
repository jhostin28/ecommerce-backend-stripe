import Stripe from "stripe";
import prisma from "../prisma.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // 1️⃣ Verificamos que Stripe sea quien llama
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature invalid:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2️⃣ Procesamos SOLO los eventos que nos importan
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const orderId = Number(paymentIntent.metadata.orderId);

    console.log("✅ PaymentIntent confirmado por Stripe");
    console.log("👉 Order ID:", orderId);

    try {
      // 3️⃣ Actualizamos el pago
      await prisma.payment.update({
        where: {
          stripePaymentIntentId: paymentIntent.id,
        },
        data: {
          status: "SUCCESS",
        },
      });

      // 4️⃣ Actualizamos la orden
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
        },
      });

      console.log("🎉 Orden marcada como PAID");
    } catch (error) {
      console.error("❌ Error actualizando DB:", error);
    }
  }

  // 5️⃣ Stripe espera SIEMPRE 200
  res.json({ received: true });
}

export default {
  handleStripeWebhook,
};
