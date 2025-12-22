const express = require("express")
const router = express.Router()

const webhooksController = require("../controllers/webhooks.controller")

// Stripe webhook
router.post("/stripe", webhooksController.stripeWebhook)

module.exports = router
