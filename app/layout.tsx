import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Header from "@/components/ui/Header/Header";
import { cn } from "@/utils/cn";
import { gotham } from "@/utils/fonts";
import { longDescription } from "@/utils/config";
import { ReadOnlyChildren } from "@/utils/types";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.amanarya.com/"),

  title: {
    template: "%s | Portfolio",
    default: "Aman Arya",
  },
  authors: {
    name: "Aman Arya",
  },
  description: longDescription,
  openGraph: {
    title: "Aman Arya | Portfolio",
    description: longDescription,
    url: "https://www.amanarya.com/",
    siteName: "Aman Arya | Portfolio",
    images: "https://www.amanarya.com/icon.png",
    type: "website",
  },
  twitter: {
    title: "Aman Arya | Portfolio",
    description: longDescription,
    images: "https://www.amanarya.com/icon.png",
  },
  keywords: ["Aman Arya", "portfolio", "Aman Arya Portfolio", "Aman Arya | Portfolio", "aman", "aman portfolio"],
  manifest: "https://www.amanarya.com/manifest.json",
  icons: [
    {
      "url": "https://www.amanarya.com/icon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "url": "https://www.amanarya.com/icon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "url": "https://www.amanarya.com/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "url": "https://www.amanarya.com/icon-1024x1024.png",
      "sizes": "1024x1024",
      "type": "image/png"
    },
    {
      "url": "https://www.amanarya.com/icon.png",
      "sizes": "234x203",
      "type": "image/png"
    },
    {
      "url": "https://www.amanarya.com/maskable_icon.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(0 0% 98%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(0 0% 7.8%)' },
  ],
}

export default function RootLayout({ children }: ReadOnlyChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(gotham.className, gotham.variable, 'antialiased overflow-x-hidden')}>

        <ThemeProvider>

          <Header />

          <QueryProvider>
            {children}
          </QueryProvider>

          <Toaster position="top-right" reverseOrder={false} />
        </ThemeProvider>

        <Analytics />
        <SpeedInsights />

      </body>
    </html>
  );
}
