import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { hashPassword, isValidPassword } from "../utils/hash.js";
import { signToken } from "../middleware/auth.js";
import { toUserCurrentDTO } from "../dto/user-current.dto.js";
import AuthService from "../services/auth.service.js";

const authService = new AuthService();

const ONE_DAY = 24 * 60 * 60 * 1000;
const cookieOpts = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: ONE_DAY,
};

export async function register(req, res, next) {
  try {
    let { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: "error", error: "Campos obligatorios faltantes" });
    }

    email = String(email).toLowerCase().trim();

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ status: "error", error: "Email ya registrado" });

    const cart = await Cart.create({ products: [] });
    const user = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashPassword(password),
      cart: cart._id, 
    });

    const token = signToken(user);
    res.cookie("jwt", token, cookieOpts);
    return res.status(201).json({ status: "success", token, user: toUserCurrentDTO(user) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ status: "error", error: "Email ya registrado" });
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: "error", error: "Email y contraseña requeridos" });
    }

    email = String(email).toLowerCase().trim();

    const user = await User.findOne({ email })
      .select("+password")   
      .populate("cart");

    if (!user || !isValidPassword(password, user.password)) {
      return res.status(401).json({ status: "error", error: "Credenciales inválidas" });
    }

    const token = signToken(user);
    res.cookie("jwt", token, cookieOpts);
    return res.json({ status: "success", token, user: toUserCurrentDTO(user) });
  } catch (e) {
    next(e);
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", { sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res.json({ status: "success" });
}

export function current(req, res) {
  return res.json({ status: "success", user: toUserCurrentDTO(req.user) });
}

// --- Recuperación de contraseña ---
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    res.json({ status: "ok" }); 
  } catch (e) {
    next(e);
  }
}

export async function doResetPassword(req, res, next) {
  try {
    const { uid, token, newPassword } = req.body;
    await authService.resetPassword({ uid, token, newPassword });
    res.json({ status: "password_updated" });
  } catch (e) {
    next(e);
  }
}
