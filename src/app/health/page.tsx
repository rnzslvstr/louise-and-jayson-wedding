// src/app/health/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function HealthPage() {
  const [state, setState] = useState<any>({ loading: true });

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((json) => setState(json))
      .catch((err) => setState({ ok: false, error: String(err) }));
  }, []);

  if (state.loading) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Health Check</h1>
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Health Check</h1>
      {state.ok ? (
        <div className="mt-4 space-y-2">
          <p>✓ Supabase connection <strong>OK</strong></p>
          <pre className="p-4 rounded bg-gray-100 overflow-auto">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <p>✗ Connection failed</p>
          <pre className="p-4 rounded bg-gray-100 overflow-auto">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
