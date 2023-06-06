import express from "express";
const router = express.Router();

import ProductManager from "../dao/controllers/products.js";
import CartModel from "../dao/models/carts.js";

import { uploader } from "../utils.js";


router.get('/products', async (req, res) => {
  try {
    const productManager = new ProductManager();
    const products = await productManager.getAllProducts();

    res.render('products', { products });
  } catch (error) {
    console.error('Error al obtener los productos', error);
    res.status(500).send('Error al obtener los productos');
  }
});


router.get("/products/register", (req, res) => {
  res.render("register");
});

router.post(
  "/products/register",
  uploader.single("Thumbnail"),
  async (req, res) => {
    const { Title, Description, Price } = req.body;

    const filename = req.file.filename;

    if (!Title || !Description || !Price || !filename)
      return res.status(400).send({ error: "Incomplete values" });

    let product = {
      Title,
      Description,
      Price,
      Thumbnail: filename,
    };

    try {
      const productManager = new ProductManager();
      const createdProduct = await productManager.createProduct(product);

      // Adding product to cart
      let cart = await CartModel.findOne({});

      if (!cart) {
        // If cart doesn't exist, create a new one
        cart = new CartModel({ products: [] });
        await cart.save();
      }

      const existingProduct = cart.products.find(
        (item) => item.product.toString() === createdProduct._id.toString()
      );

      if (existingProduct) {
        // If the product already exists in the cart, increase the quantity
        existingProduct.quantity += 1;
      } else {
        // If the product is new to the cart, add it with quantity 1
        cart.products.push({
          product: createdProduct._id,
          quantity: 1,
        });
      }

      await cart.save();

      res.status(200).send({ success: "Product created!" });
    } catch (error) {
      console.error("Error creating the product", error);
      res.status(500).send({ error: "Error creating the product" });
    }
  }
);


router.get("/products/list", async (req, res) => {
  try {
    const { limit, page, sort, query } = req.query;

    const productManager = new ProductManager();
    const products = await productManager.getProducts(limit, page, sort, query);
    res.status(200).render("index", { products: products });
  } catch (error) {
    console.error("Error getting the list of products", error);
    res
      .status(500)
      .json({ error: "Error getting the list of products: " + error.message });
  }
});

router.delete("/carts/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (product) => product.product.toString() === pid
    );

    if (productIndex === -1) {
      return res.status(404).send({ error: "Product not found in cart" });
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    res.status(200).send({ success: "Product removed from cart" });
  } catch (error) {
    console.error("Error removing product from cart", error);
    res.status(500).send({ error: "Error removing product from cart" });
  }
});

router.put("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await CartModel.findById(cid);

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    cart.products = products;
    await cart.save();

    res.status(200).send({ success: "Cart updated" });
  } catch (error) {
    console.error("Error updating cart", error);
    res.status(500).send({ error: "Error updating cart" });
  }
});

router.put("/carts/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await CartModel.findById(cid);

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    const product = cart.products.find((p) => p.product.toString() === pid);

    if (!product) {
      return res.status(404).send({ error: "Product not found in cart" });
    }

    product.quantity = parseInt(quantity); // Actualiza la cantidad del producto convirtiendo a entero

    await cart.save();

    res.status(200).send({ success: "Product quantity updated" });
  } catch (error) {
    console.error("Error updating product quantity", error);
    res.status(500).send({ error: "Error updating product quantity" });
  }
});


router.delete("/carts/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findByIdAndDelete(cid);

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    res.status(200).send({ success: "Cart deleted" });
  } catch (error) {
    console.error("Error deleting cart", error);
    res.status(500).send({ error: "Error deleting cart" });
  }
});

export default router;
