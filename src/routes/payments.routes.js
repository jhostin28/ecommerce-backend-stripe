const express = require("express")
const router = express.Router()

const paymentsController = require("../controllers/payments.controller")
const authMiddleware = require("../middlewares/auth.middleware")

// POST /payments/create-intent
router.post(
  "/create-intent",
  authMiddleware,
  paymentsController.createPaymentIntent
)

module.exports = router
