import { Router } from "express";
import passport from "passport";
import Product from "../../models/Product.js";
import { authorizeRoles } from "../../middleware/authorize.js";

const r = Router();

/**
 * GET /api/products
 * Público (o si querés, podés protegerlo)
 */
r.get("/", async (req, res) => {
  const { q, category } = req.query;
  const filter = {};
  if (q) filter.title = { $regex: String(q), $options: "i" };
  if (category) filter.category = category;

  const products = await Product.find(filter).lean();
  res.json({ status: "success", payload: products });
});

/**
 * GET /api/products/:pid
 * Público
 */
r.get("/:pid", async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid).lean();
  if (!product) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
  res.json({ status: "success", payload: product });
});

/**
 * POST /api/products
 * Solo ADMIN
 */
r.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const data = req.body;
      if (!data.title || data.price == null || data.stock == null) {
        return res.status(400).json({ status: "error", error: "title, price y stock son obligatorios" });
      }
      if (data.price < 0 || data.stock < 0) {
        return res.status(400).json({ status: "error", error: "price/stock no pueden ser negativos" });
      }
      const created = await Product.create({
        title: data.title,
        description: data.description ?? "",
        price: Number(data.price),
        stock: Number(data.stock),
        category: data.category ?? null,
        status: data.status ?? true,
        thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails : [],
      });
      res.status(201).json({ status: "success", payload: created });
    } catch (err) {
      console.error(err);
      res.status(400).json({ status: "error", error: "No se pudo crear el producto" });
    }
  }
);

/**
 * PUT /api/products/:pid
 * Solo ADMIN
 */
r.put(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { pid } = req.params;
      const data = { ...req.body };

      if (data.price != null && data.price < 0) {
        return res.status(400).json({ status: "error", error: "price no puede ser negativo" });
      }
      if (data.stock != null && data.stock < 0) {
        return res.status(400).json({ status: "error", error: "stock no puede ser negativo" });
      }

      const updated = await Product.findByIdAndUpdate(pid, data, { new: true });
      if (!updated) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
      res.json({ status: "success", payload: updated });
    } catch (err) {
      console.error(err);
      res.status(400).json({ status: "error", error: "No se pudo actualizar" });
    }
  }
);

/**
 * DELETE /api/products/:pid
 * Solo ADMIN
 */
r.delete(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { pid } = req.params;
      const deleted = await Product.findByIdAndDelete(pid);
      if (!deleted) return res.status(404).json({ status: "error", error: "Producto no encontrado" });
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.status(400).json({ status: "error", error: "No se pudo eliminar" });
    }
  }
);

export default r;
