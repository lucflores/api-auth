import { Router } from "express";
import passport from "passport";
import mongoose from "mongoose";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import { authorizeRoles, authorizeCartOwner } from "../../middleware/authorize.js";

const r = Router();

// Todas requieren estar logueado
r.use(passport.authenticate("jwt", { session: false }));

// Helper: dueño del carrito o admin
function ownerOrAdmin(req, res, next) {
  const isOwner = String(req.params.cid) === String(req.user.cart || "");
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ status: "error", error: "No autorizado" });
  }
  next();
}

/**
 * GET /api/carts/:cid
 * Dueño del carrito o admin
 */
r.get("/:cid", ownerOrAdmin, async (req, res) => {
  const { cid } = req.params;
  const cart = await Cart.findById(cid).populate("products.product").lean();
  if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
  res.json({ status: "success", payload: cart });
});

/**
 * POST /api/carts/:cid/products/:pid
 * Solo USER y además debe ser el dueño del carrito (authorizeCartOwner)
 * Body opcional: { "quantity": 2 }
 */
r.post("/:cid/products/:pid", authorizeCartOwner, async (req, res) => {
  const { cid, pid } = req.params;
  const quantity = Math.max(1, Number(req.body?.quantity ?? 1));

  const [cart, product] = await Promise.all([
    Cart.findById(cid),
    Product.findById(pid),
  ]);

  if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
  if (!product) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
  if (product.stock < quantity) {
    return res.status(400).json({ status: "error", error: "Stock insuficiente" });
  }

  const idx = cart.products.findIndex(p => String(p.product) === String(pid));
  if (idx >= 0) {
    cart.products[idx].quantity += quantity;
  } else {
    cart.products.push({ product: product._id, quantity });
  }

  await cart.save();
  res.json({ status: "success", payload: cart });
});

/**
 * PUT /api/carts/:cid/products/:pid
 * Setear cantidad exacta (si quantity = 0 -> remover)
 * Solo USER dueño del carrito
 */
r.put("/:cid/products/:pid", authorizeCartOwner, async (req, res) => {
  const { cid, pid } = req.params;
  const quantity = Number(req.body?.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return res.status(400).json({ status: "error", error: "quantity inválida" });
  }

  const [cart, product] = await Promise.all([
    Cart.findById(cid),
    Product.findById(pid),
  ]);
  if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });
  if (!product) return res.status(404).json({ status: "error", error: "Producto no encontrado" });

  const idx = cart.products.findIndex(p => String(p.product) === String(pid));
  if (idx < 0) return res.status(404).json({ status: "error", error: "Producto no está en el carrito" });

  if (quantity === 0) {
    cart.products.splice(idx, 1);
  } else {
    if (product.stock < quantity) {
      return res.status(400).json({ status: "error", error: "Stock insuficiente" });
    }
    cart.products[idx].quantity = quantity;
  }

  await cart.save();
  res.json({ status: "success", payload: cart });
});

/**
 * DELETE /api/carts/:cid/products/:pid
 * Solo USER dueño del carrito
 */
r.delete("/:cid/products/:pid", authorizeCartOwner, async (req, res) => {
  const { cid, pid } = req.params;

  const cart = await Cart.findById(cid);
  if (!cart) return res.status(404).json({ status: "error", error: "Carrito no encontrado" });

  const before = cart.products.length;
  cart.products = cart.products.filter(p => String(p.product) !== String(pid));
  if (cart.products.length === before) {
    return res.status(404).json({ status: "error", error: "Producto no estaba en el carrito" });
  }

  await cart.save();
  res.json({ status: "success", payload: cart });
});

/**
 * POST /api/carts/:cid/checkout
 * Solo USER dueño del carrito
 * Descuenta stock y vacía el carrito.
 */
r.post("/:cid/checkout", authorizeCartOwner, async (req, res) => {
  const { cid } = req.params;
  const session = await mongoose.startSession();

  try {
    let ticket = { items: [], itemsCount: 0, total: 0, purchasedAt: new Date() };

    await session.withTransaction(async () => {
      const cart = await Cart.findById(cid).populate("products.product").session(session);
      if (!cart || !cart.products?.length) throw new Error("Carrito vacío");

      // Verificación de stock
      for (const item of cart.products) {
        const p = item.product;
        if (!p) throw new Error("Producto inválido en carrito");
        if (p.stock < item.quantity) {
          throw new Error(`Sin stock para "${p.title}"`);
        }
      }

      // Descuento de stock y cálculo de total
      for (const item of cart.products) {
        const p = item.product;
        await Product.findByIdAndUpdate(
          p._id,
          { $inc: { stock: -item.quantity } },
          { session }
        );
        ticket.items.push({
          productId: p._id,
          title: p.title,
          price: p.price,
          quantity: item.quantity,
          subtotal: p.price * item.quantity,
        });
        ticket.total += p.price * item.quantity;
        ticket.itemsCount += item.quantity;
      }

      // Vaciar carrito
      cart.products = [];
      await cart.save({ session });
    });

    res.json({ status: "success", ticket });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: "error", error: err.message || "No se pudo completar la compra" });
  } finally {
    session.endSession();
  }
});

export default r;
