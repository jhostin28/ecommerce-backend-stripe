import  prisma  from "../prisma.js";

/**
 * GET /orders/:id
 * Controlador de SOLO LECTURA
 */
export const getOrderById = async (req, res) => {
  try {
    // 1️⃣ Validamos que venga un orderId
    const { id: orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID is required",
      });
    }

    // 2️⃣ Usuario autenticado
    const user = req.user;

    // Validación defensiva (tokens viejos o corruptos)
    if (!user || !user.role) {
      return res.status(401).json({
        message: "Invalid authentication data",
      });
    }

    // 3️⃣ Buscamos la orden
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 4️⃣ Verificación de permisos
    const isOwner = order.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Access denied to this order",
      });
    }

    // 5️⃣ Construimos respuesta segura
    const response = {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      items: Array.isArray(order.items)
        ? order.items.map((item) => ({
            productName: item.product?.name || "Unknown product",
            quantity: item.quantity,
            price: item.price,
          }))
        : [],
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching order:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
