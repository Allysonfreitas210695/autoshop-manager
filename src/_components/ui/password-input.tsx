"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { cn } from "@/_lib/utils";

import { Input } from "./input";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        className={cn("pr-9", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="text-on-surface-variant/60 hover:text-on-surface absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
