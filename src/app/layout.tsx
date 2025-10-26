import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "Louise & Jayson — Wedding",
    template: "%s · Louise & Jayson — Wedding",
  },
  description: "Wedding details and RSVP for Louise & Jayson",
  openGraph: {
    title: "Louise & Jayson — Wedding",
    description: "Wedding details and RSVP",
    type: "website",
  },
  icons: { icon: "/favicon.ico" },
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
