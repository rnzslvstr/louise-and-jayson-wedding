"use client";

export default function Spinner({ size = 20 }: { size?: number }) {
  const s = size + "px";
  return (
    <span
      aria-label="Loading"
      role="status"
      style={{
        display: "inline-block",
        width: s,
        height: s,
        borderRadius: 999,
        border: "2px solid var(--border)",
        borderTopColor: "var(--c-rose)",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}
