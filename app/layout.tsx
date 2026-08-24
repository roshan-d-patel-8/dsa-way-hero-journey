import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/press-start-2p";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "dsa-way-hero-journey.roshan-patel.chatgpt.site";
  const origin = `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
  const title = "The DSA Way: The Hero's Journey";
  const description = "A cinematic, game-inspired journey through the DSA Way and the Five Whys.";

  return {
    title,
    description,
    openGraph: { title, description, images: [`${origin}/og.png`] },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
