const Stripe = require("stripe")
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const prisma = require("../prisma")

// Stripe envía eventos aquí
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"]

  let event

  try {
    // Verificamos que el evento viene realmente de Stripe
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature failed:", err.message)
    return res.status(400).send(`Webhook Error`)
  }

  // 🔔 Evento confirmado
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object

    // Buscamos el pago en la BD
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id
      }
    })

    if (payment) {
      // Actualizamos pago
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" }
      })

      // Actualizamos orden
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" }
      })
    }
  }

  res.json({ received: true })
}
