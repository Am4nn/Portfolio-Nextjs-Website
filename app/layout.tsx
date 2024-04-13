import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeSwitch from "@/components/ui/ThemeSwitch/ThemeSwitch";
import ScrollUpButton from "@/components/ui/ScrollUpButton/ScrollUpButton";
import { cn } from "@/utils/cn";
import { gotham } from "@/utils/fonts";
import { ReadOnlyChildren } from "@/utils/types";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://next.amanarya.com/"),

  title: {
    template: "%s | Portfolio",
    default: "Aman Arya",
  },
  authors: {
    name: "Aman Arya",
  },

  description:
    "Aman Arya's Portfolio website",
  openGraph: {
    title: "Aman Arya | Portfolio",
    description: "Aman Arya's Portfolio website",
    url: "https://next.amanarya.com/",
    siteName: "Aman Arya | Portfolio",
    images: "/og.png",
    type: "website",
  },
  keywords: ["Aman Arya", "portfolio", "Aman Arya Portfolio", "Aman Arya | Portfolio", "aman", "aman portfolio"],
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <ThemeSwitch />
          <ScrollUpButton />

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
