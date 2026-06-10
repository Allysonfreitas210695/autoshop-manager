import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "./_components/ResetPasswordForm";

export const metadata: Metadata = { title: "Redefinir Senha — Precision Auto" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
