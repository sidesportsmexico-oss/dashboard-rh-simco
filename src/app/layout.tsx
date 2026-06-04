import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { SimcoLogo } from "@/components/simco-logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMCO · Dashboard RH",
  description: "Dashboard ejecutivo de Recursos Humanos · SIMCO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full text-[var(--color-text)]">
        <Sidebar logo={<SimcoLogo />} />
        <main className="md:pl-64">
          <div className="px-6 md:px-10 py-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </body>
    </html>
  );
}
