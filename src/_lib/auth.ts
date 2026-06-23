import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/_db";
import { account, session, user, verification } from "@/_db/schema";
import { sendEmail } from "@/_lib/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    // Mirrors the Zod floor (SEC-01 / D-08). Better Auth has no native
    // complexity validator, so this only enforces length server-side.
    minPasswordLength: 8,
    sendResetPassword: async ({ user: recipient, url }) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[reset-password] link:", url);
        return;
      }
      await sendEmail({
        to: recipient.email,
        subject: "Redefinição de senha — Precision Auto",
        html: `
          <div style="font-family:monospace;max-width:480px;margin:0 auto;padding:32px 24px">
            <h2 style="font-size:18px;margin-bottom:8px">Redefinir sua senha</h2>
            <p style="color:#555;margin-bottom:24px">
              Recebemos uma solicitação para redefinir a senha da sua conta.<br>
              Clique no botão abaixo para criar uma nova senha.
            </p>
            <a href="${url}"
               style="display:inline-block;background:#1A4FAD;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700">
              Redefinir Senha
            </a>
            <p style="color:#999;font-size:12px;margin-top:24px">
              Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este e-mail.
            </p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
