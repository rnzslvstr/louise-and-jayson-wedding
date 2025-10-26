"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // You could report error.digest to logs here
    // console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="page container">
          <div className="surface p-6">
            <h1 className="h1">Something went wrong</h1>
            <p className="mt-2">
              We’re sorry — an unexpected error occurred.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
              <a href="/" className="btn btn-neutral">Go home</a>
            </div>
            <pre className="mt-4 text-xs muted" style={{ whiteSpace: "pre-wrap" }}>
              {error?.message}
            </pre>
          </div>
        </main>
      </body>
    </html>
  );
}
