"use client";

import { useEffect, useState } from "react";

function getLocale(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("locale") || "es";
  }
  return "es";
}

const messages: Record<string, { critical: string; failed: string; tryAgain: string }> = {
  es: { critical: "Error Crítico", failed: "La aplicación no pudo cargarse.", tryAgain: "Intentar de nuevo" },
  en: { critical: "Critical Error", failed: "The application failed to load.", tryAgain: "Try again" },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState("es");

  useEffect(() => {
    setLocale(getLocale());
  }, []);

  const msg = messages[locale] || messages.es;

  return (
    <html>
      <body className="bg-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">{msg.critical}</h1>
          <p className="text-muted-foreground mb-8">
            {error.message || msg.failed}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
          >
            {msg.tryAgain}
          </button>
        </div>
      </body>
    </html>
  );
}
