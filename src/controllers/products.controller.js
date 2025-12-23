// Importamos Prisma usando ES Modules
import prisma from '../prisma.js';

// Obtener todos los productos
async function getAllProducts(req, res) {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching products' });
  }
}

// Crear un producto
async function createProduct(req, res) {
  try {
    const { name, price, category, stock, imageUrl, description } = req.body;

    // Validaciones
    if (!name || typeof name !== 'string' || name.length < 3) {
      return res.status(400).json({ error: 'Name must be at least 3 characters' });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Price must be a number greater than 0' });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ error: 'Stock must be an integer >= 0' });
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Crear producto
    const product = await prisma.product.create({
      data: {
        name,
        price,
        category,
        stock,
        imageUrl,
        description,
      },
    });

    return res.status(201).json(product);

  } catch (error) {
    // Producto duplicado (name @unique)
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Product with this name already exists',
      });
    }

    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Actualizar producto
async function updateProduct(req, res) {
  try {
    const productId = Number(req.params.id);
    const { name, price, category, stock, imageUrl, description } = req.body;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        category,
        stock,
        imageUrl,
        description,
      },
    });

    return res.json(updatedProduct);

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Product with this name already exists',
      });
    }

    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Eliminar producto
async function deleteProduct(req, res) {
  try {
    const productId = Number(req.params.id);

    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// ⬅️ EXPORT DEFAULT (CLAVE)
export default {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
