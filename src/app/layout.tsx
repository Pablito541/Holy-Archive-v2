import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fafaf9",
};

export const metadata: Metadata = {
  title: "Holy Archive",
  description: "Inventory & Profit Tracking",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Holy Archive",
  },
};

import { ToastProvider } from "../components/ui/Toast";

// ... imports ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.className} ${playfair.variable} bg-[#fafaf9] min-h-screen`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}