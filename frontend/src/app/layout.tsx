import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sorteador de Times",
  description: "Divisão equilibrada de times para pelada de basquete",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
