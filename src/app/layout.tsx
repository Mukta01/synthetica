import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synthetica: The Genome Editor",
  description: "A logic puzzle game where biology meets programming. Splice and edit DNA sequences to engineer organisms that survive extreme environments.",
  keywords: ["bioinformatics", "puzzle game", "DNA", "genetics", "genome editor"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
