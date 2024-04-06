import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import DarkModeSwitch from "@/components/ui/DarkModeSwitch/DarkModeSwitch";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://amanarya.com/"),

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
    url: "https://amanarya.com/",
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
      <body className={`${inter.className} antialiased overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <DarkModeSwitch />
          <QueryProvider>
            {children}
          </QueryProvider>

          <Toaster position="top-right" reverseOrder={false} />
        </ThemeProvider>

        <Analytics />

      </body>
    </html>
  );
}
