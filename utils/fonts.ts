import localFont from 'next/font/local'
import { Inter, Montserrat, Raleway, Quantico, Tiro_Devanagari_Hindi } from "next/font/google";

export const gotham = localFont({
  src: '../public/fonts/gotham-book.woff2',
  variable: '--font-gotham',
  display: 'swap' // Ensures text is visible while the font loads
});

export const gotham_medium = localFont({
  src: '../public/fonts/gotham-medium.woff2',
  variable: '--font-gotham-medium',
  display: 'swap' // Ensures text is visible while the font loads
});

export const inter = Inter({
  subsets: ["latin"],
  display: 'swap'
});

export const montserrat = Montserrat({
  style: "normal",
  subsets: ["latin"],
  display: 'swap'
});

export const raleway = Raleway({
  weight: "200",
  style: "normal",
  subsets: ["latin"],
  display: 'swap'
});

export const quantico = Quantico({
  weight: "700",
  style: "normal",
  subsets: ["latin"],
  display: 'swap'
});

export const tiro_Devanagari_Hindi = Tiro_Devanagari_Hindi({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-tiro-devanagari-hindi'
});
