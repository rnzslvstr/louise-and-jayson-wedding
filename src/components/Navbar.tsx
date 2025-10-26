"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/venue", label: "Venue" },
  { href: "/need-to-know", label: "Need to know" },
  { href: "/rsvp", label: "RSVP" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header
      className="w-full"
      style={{ background: "var(--c-peach)", borderBottom: "1px solid var(--border)" }}
    >
      <nav className="container flex items-center justify-between py-3">
        <Link href="/" className="font-semibold text-lg">
          Louise & Jayson
        </Link>
        <ul className="flex gap-3">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="px-3 py-2 rounded-lg"
                  style={{
                    background: active ? "var(--c-shell)" : "transparent",
                    color: "var(--text-main)",
                    border: active ? "1px solid var(--border)" : "1px solid transparent",
                  }}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
