// ==============================
// IMPORTS
// ==============================

import Stripe from "stripe";
import prisma from "../prisma.js";

// Inicializamos Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ==============================
// STRIPE WEBHOOK CONTROLLER
// ==============================

export async function stripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];
  let event;

  // ==============================
  // 1️⃣ VERIFICAR FIRMA
  // ==============================
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("❌ Webhook signature verification failed:", error.message);
    return res.status(400).send("Webhook Error");
  }

  console.log("🔥 STRIPE EVENT:", event.type);

  // ==============================
  // 2️⃣ PAYMENT SUCCEEDED
  // ==============================
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const orderId = Number(paymentIntent.metadata.orderId);

    try {
      await prisma.$transaction(async (tx) => {
        // 1️⃣ Actualizar pago (PaymentStatus)
        await tx.payment.update({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: "SUCCEEDED", // ✅ ENUM CORRECTO
          },
        });

        // 2️⃣ Marcar orden como pagada (OrderStatus)
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        });
      });

      console.log("✅ PAYMENT SUCCEEDED & ORDER PAID");
    } catch (error) {
      console.error("❌ WEBHOOK ERROR:", error);
      return res.status(500).json({ error: "Webhook failed" });
    }
  }


  // Stripe exige siempre 200
  return res.json({ received: true });
}
