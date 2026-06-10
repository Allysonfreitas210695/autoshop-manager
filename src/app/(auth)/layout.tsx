import { Wrench } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface px-md py-xl flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="bg-secondary-container text-on-secondary-container flex size-12 items-center justify-center rounded-lg">
            <Wrench className="size-6" />
          </span>
          <h1 className="text-headline-lg text-on-surface font-semibold">
            Precision Auto
          </h1>
          <p className="text-label-md text-on-surface-variant/70 font-mono">
            AUTOSHOP MANAGER
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
