import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import localFont from 'next/font/local'
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeSwitch from "@/components/ui/ThemeSwitch/ThemeSwitch";
import ScrollUpButton from "@/components/ui/ScrollUpButton/ScrollUpButton";
import "./globals.css";

const gotham = localFont({ src: '../public/fonts/gotham-medium.woff2' })

// const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${gotham.className} antialiased overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
