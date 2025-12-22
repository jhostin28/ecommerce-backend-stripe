// Importamos Stripe
const Stripe = require("stripe")

// Inicializamos Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Importamos Prisma
const prisma = require("../prisma")

// Crear PaymentIntent
exports.createPaymentIntent = async (req, res) => {
  try {
    // El usuario autenticado viene del JWT
    const userId = req.user.userId

    // Recibimos el orderId desde el body
    const { orderId } = req.body

    // Validación básica
    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" })
    }

    // Buscamos la orden en la base de datos
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) }
    })

    // Verificamos que la orden exista y sea del usuario
    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: "Order not found" })
    }

    // Solo se puede pagar una orden PENDING
    if (order.status !== "PENDING") {
      return res.status(400).json({
        error: "Order is not payable"
      })
    }

    // Creamos el PaymentIntent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100), // Stripe usa centavos
      currency: "usd",
      // 🔒 SOLO TARJETA, SIN REDIRECCIONES
      payment_method_types: ["card"],
      
      metadata: {
        orderId: order.id
      }
    })

    // Guardamos el pago en la base de datos
    await prisma.payment.create({
      data: {
        orderId: order.id,
        status: "PENDING",
        amount: order.totalAmount,
        stripePaymentIntentId: paymentIntent.id
      }
    })

    // Devolvemos el clientSecret al frontend
    return res.json({
      clientSecret: paymentIntent.client_secret
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}
