import type { Metadata } from "next";
import { Syncopate, Space_Mono } from "next/font/google";
import "./globals.css";

const syncopate = Syncopate({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "DataStream — Vos données. Propres. En temps réel. Sans équipe data.",
  description:
    "Pipeline de données intelligent — ingestion, transformation, validation et orchestration automatiques.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${syncopate.variable} ${spaceMono.variable}`}>
      <body
        style={{
          backgroundColor: "#f0fdfa",
          fontFamily: "var(--font-body)",
          margin: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
