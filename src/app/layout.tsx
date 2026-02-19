import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const roboto = Roboto({
  subsets: ["cyrillic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3f51b5",
};

export const metadata: Metadata = {
  title: "Матрица чисел",
  description: "Расчёт матрицы чисел по дате рождения для самопознания",
  keywords: ["матрица", "числа", "нумерология", "дата рождения", "калькулятор"],
  authors: [{ name: "Матрица чисел" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Матрица чисел",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* iOS PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Матрица чисел" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* iOS Splash Screen Colors */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preload fonts for offline */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Fallback for older iOS */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
      </head>
      <body
        className={`${roboto.variable} font-sans antialiased bg-white text-foreground`}
        style={{ fontFamily: "'Roboto', sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
