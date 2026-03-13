import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { QueryProvider } from "@/context/QueryProvider";

export const metadata: Metadata = {
  title: "Grahvani Admin | Platform Administration",
  description: "Grahvani Vedic Astrology Platform — Administration Panel",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <QueryProvider>
          <AdminAuthProvider>{children}</AdminAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
