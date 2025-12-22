const prisma = require("../prisma")

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany()
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error fetching products" })
  }
}

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, stock, imageUrl, description } = req.body

    // 🔴 Validaciones
    if (!name || typeof name !== "string" || name.length < 3) {
      return res.status(400).json({ error: "Name must be at least 3 characters" })
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({ error: "Price must be a number greater than 0" })
    }

    if (!category || typeof category !== "string") {
      return res.status(400).json({ error: "Category is required" })
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ error: "Stock must be an integer >= 0" })
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({ error: "Image URL is required" })
    }

    // 🟢 Crear producto
    const product = await prisma.product.create({
      data: {
        name,
        price,
        category,
        stock,
        imageUrl,
        description
      }
    })

    return res.status(201).json(product)

  } catch (error) {

    // 🟥 Producto duplicado (name @unique)
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Product with this name already exists"
      })
    }

    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}


exports.updateProduct = async (req, res) => {
  try {
    // Obtenemos el ID desde la URL
    const productId = Number(req.params.id)

    // Obtenemos los datos del body
    const { name, price, category, stock, imageUrl, description } = req.body

    // Validamos que el ID sea un número válido
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" })
    }

    // Buscamos el producto en la base de datos
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    // Si no existe, devolvemos 404
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Actualizamos solo los campos enviados
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        category,
        stock,
        imageUrl,
        description
      }
    })

    // Respondemos con el producto actualizado
    return res.json(updatedProduct)

  } catch (error) {

    // Error de nombre duplicado (@unique)
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Product with this name already exists"
      })
    }

    // Error inesperado
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    // Obtenemos el ID desde la URL
    const productId = Number(req.params.id)

    // Validamos que el ID sea un número válido
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" })
    }

    // Verificamos si el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    // Si no existe, devolvemos 404
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Eliminamos el producto de la base de datos
    await prisma.product.delete({
      where: { id: productId }
    })

    // Respondemos confirmando la eliminación
    return res.json({ message: "Product deleted successfully" })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

