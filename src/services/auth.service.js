import bcrypt from "bcrypt";
import UserDAO from "../dao/user.dao.js";
import UserRepository from "../repositories/user.repository.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { generateRawToken, sha256 } from "../utils/tokens.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const userRepo = new UserRepository(new UserDAO());

export default class AuthService {
  // 1) Solicitar reset
  async requestPasswordReset(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) return; // no revelar existencia

    // invalidar tokens previos
    await PasswordResetToken.updateMany(
      { userId: user._id, used: false, expiresAt: { $gt: new Date() } },
      { $set: { used: true } }
    );

    const raw = generateRawToken();
    const tokenHash = sha256(raw);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const link = `${process.env.APP_URL}/reset-password?token=${raw}&uid=${user._id}`;
    await sendPasswordResetEmail({ to: user.email, name: user.first_name, link });
  }

  // 2) Confirmar reset
  async resetPassword({ uid, token, newPassword }) {
    const tokenHash = sha256(token);
    const record = await PasswordResetToken.findOne({
      userId: uid, tokenHash, used: false, expiresAt: { $gt: new Date() }
    });
    if (!record) throw new Error("Token inválido o expirado");

    const user = await userRepo.findById(uid);
    if (!user) throw new Error("Usuario no encontrado");

    // no permitir la misma contraseña
    const same = await bcrypt.compare(newPassword, user.password);
    if (same) throw new Error("La nueva contraseña no puede ser igual a la anterior");

    const hash = await bcrypt.hash(newPassword, 10);
    await userRepo.updatePassword(uid, hash);

    record.used = true;
    await record.save();
  }
}
