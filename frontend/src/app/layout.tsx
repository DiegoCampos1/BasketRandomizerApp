import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import QueryProvider from "@/components/providers/QueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sorteador de Times",
  description: "Divisão equilibrada de times para peladas esportivas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} ${barlow.className}`}
      >
        <ThemeRegistry>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
