import { Router } from "express";
import passport from "passport";
import { register, login, logout, current, forgotPassword, doResetPassword } from "../../controllers/sessions.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/current",
  passport.authenticate("jwt", { session: false }),
  current
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", doResetPassword);

export default router;
