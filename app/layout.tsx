import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hitpoint Terminal - Live Crypto Intelligence",
  description: "Professional-grade real-time crypto analytics terminal",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
