import type { Metadata } from "next";
import "./globals.css";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { QueryProvider } from "@/context/QueryProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grahvani Admin | Platform Administration",
  description: "Grahvani Vedic Astrology Platform — Administration Panel",
  robots: "noindex, nofollow",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <QueryProvider>
          <AdminAuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AdminAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
