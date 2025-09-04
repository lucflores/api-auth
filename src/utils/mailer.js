import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export async function sendPasswordResetEmail({ to, name, link }) {
  const html = `
    <div style="font-family:system-ui,Arial">
      <h2>Restablecer contraseña</h2>
      <p>Hola ${name || ""}, solicitaste cambiar tu contraseña.</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#222;color:#fff;text-decoration:none">
        Restablecer contraseña
      </a></p>
      <p>El enlace vence en 1 hora. Si no fuiste vos, ignora este mensaje.</p>
    </div>`;
  await mailer.sendMail({
    from: process.env.MAIL_FROM,
    to, subject: "Restablecer contraseña", html
  });
}
