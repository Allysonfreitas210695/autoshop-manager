import type { Metadata } from "next";

import { ForgotPasswordForm } from "./_components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Esqueci a Senha — Precision Auto" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
