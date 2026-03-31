import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Five Realms",
  description: "A card battle game inspired by Irish mythology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
