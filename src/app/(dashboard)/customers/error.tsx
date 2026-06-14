"use client";

export default function CustomersError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
      <p className="text-on-surface-variant font-mono text-sm">
        Ocorreu um erro inesperado.
      </p>
      {process.env.NODE_ENV === "development" && (
        <p className="text-error font-mono text-xs">{error.message}</p>
      )}
      <button
        onClick={unstable_retry}
        className="text-secondary font-mono text-sm underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}
