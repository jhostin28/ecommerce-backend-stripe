const express = require("express")
const bodyParser = require("body-parser")

const app = express()

// 🔴 Stripe necesita el body RAW para validar la firma
app.use(
  "/webhooks/stripe",
  bodyParser.raw({ type: "application/json" })
)

// 🟢 JSON normal para el resto de la app
app.use(express.json())

// Ruta raíz
app.get("/", (req, res) => {
  res.send("🚀 API E-commerce funcionando")
})

// Rutas
app.use("/products", require("./routes/products.routes"))
app.use("/users", require("./routes/users.routes"))
app.use("/orders", require("./routes/orders.routes"))
app.use("/payments", require("./routes/payments.routes"))
app.use("/webhooks", require("./routes/webhooks.routes"))

// Puerto
app.listen(3000, () => {
  console.log("🔥 Server running on http://localhost:3000")
})
