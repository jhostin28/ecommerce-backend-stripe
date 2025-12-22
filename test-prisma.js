const { PrismaClient, Prisma } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {

  // 1️⃣ USER (no se duplica)
  const user = await prisma.user.upsert({
    where: { email: "test@email.com" },
    update: {},
    create: {
      email: "test@email.com",
      password: "hashed-password",
      address: "Santo Domingo Este"
    }
  })

  console.log("✅ User:", user.id)

  // 2️⃣ PRODUCT (no se duplica)
  const product = await prisma.product.upsert({
    where: { name: "iPhone 15" },
    update: {},
    create: {
      name: "iPhone 15",
      price: new Prisma.Decimal("1500"),
      category: "Phones",
      stock: 10,
      imageUrl: "https://image.com/iphone.jpg"
    }
  })

  console.log("✅ Product:", product.id)

  // 3️⃣ ORDER + ITEMS
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: "PENDING",
      totalAmount: new Prisma.Decimal("1500"),
      shippingAddress: "Santo Domingo Este",
      items: {
        create: {
          productId: product.id,
          quantity: 1
        }
      }
    },
    include: {
      items: true
    }
  })

  console.log("✅ Order:", order.id)

  // 4️⃣ PAYMENT
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      status: "PENDING",
      amount: new Prisma.Decimal("1500"),
      stripePaymentIntentId: "pi_test_123"
    }
  })

  console.log("✅ Payment:", payment.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
