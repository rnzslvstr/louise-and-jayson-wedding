import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Louise & Jayson — Wedding",
  description: "Wedding details and RSVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="container mt-12 mb-8 text-sm muted">
          © {new Date().getFullYear()} Louise & Jayson — all our love.
        </footer>
      </body>
    </html>
  );
}
