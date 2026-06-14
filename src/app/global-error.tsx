"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-background min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Critical Error</h1>
          <p className="text-muted-foreground mb-8">
            {error.message || "The application failed to load."}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
