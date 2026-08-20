import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The DSA Way: A Hero's Journey",
  description: "A whimsical, game-inspired journey through the DSA Way.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
