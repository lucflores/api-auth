import { Router } from "express";
import passport from "passport";
import User from "../../models/User.js";
import { hashPassword } from "../../utils/hash.js";
import { authorizeRoles } from "../../middleware/authorize.js";
import { toUserCurrentDTO } from "../../dto/user-current.dto.js";

const r = Router();

// Todas estas rutas requieren estar logueado
r.use(passport.authenticate("jwt", { session: false }));

// LISTAR USUARIOS (solo admin)
r.get("/", authorizeRoles("admin"), async (_req, res) => {
  const users = await User.find().lean(); // password está oculto por select:false
  res.json({ status: "success", payload: users });
});

// PERFIL DEL USUARIO LOGUEADO
r.get("/me", async (req, res) => {
  res.json({ status: "success", payload: toUserCurrentDTO(req.user) });
});

// CREAR USUARIO (solo admin)
r.post("/", authorizeRoles("admin"), async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.first_name || !data.last_name || !data.email || !data.password) {
      return res.status(400).json({ status: "error", error: "Campos obligatorios faltantes" });
    }

    data.email = String(data.email).toLowerCase().trim();

    const exists = await User.findOne({ email: data.email });
    if (exists) {
      return res.status(409).json({ status: "error", error: "Email ya registrado" });
    }

    data.password = hashPassword(data.password);
    const created = await User.create(data);
    res.status(201).json({ status: "success", payload: created });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ status: "error", error: "Email ya registrado" });
    }
    console.error(err);
    res.status(400).json({ status: "error", error: "No se pudo crear el usuario" });
  }
});

// ACTUALIZAR USUARIO (admin o el propio usuario)
// Nota: si NO sos admin, no podés cambiar role/email/cart
r.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const isAdmin = req.user.role === "admin";
    const isSelf = req.user._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ status: "error", error: "No autorizado" });
    }

    const data = { ...req.body };

    // Normalizar email si viene
    if (data.email) data.email = String(data.email).toLowerCase().trim();

    // Si no es admin, restringir campos
    if (!isAdmin) {
      delete data.role;
      delete data.email;
      delete data.cart;
    }

    // Hashear password si se envía
    if (data.password) data.password = hashPassword(data.password);

    const updated = await User.findByIdAndUpdate(id, data, { new: true });
    if (!updated) {
      return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
    }

    res.json({ status: "success", payload: updated });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ status: "error", error: "Email ya registrado" });
    }
    console.error(err);
    res.status(400).json({ status: "error", error: "No se pudo actualizar" });
  }
});

// ELIMINAR USUARIO (solo admin)
r.delete("/:id", authorizeRoles("admin"), async (req, res) => {
  const { id } = req.params;
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ status: "error", error: "Usuario no encontrado" });
  }
  res.json({ status: "success" });
});

export default r;
