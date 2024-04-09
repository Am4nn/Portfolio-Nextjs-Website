import localFont from 'next/font/local'
import { Inter, Montserrat, Raleway, Quantico } from "next/font/google";

export const gotham = localFont({ src: '../public/fonts/gotham-book.woff2' });
export const gotham_medium = localFont({ src: '../public/fonts/gotham-medium.woff2' });
export const inter = Inter({ subsets: ["latin"], display: 'swap' });
export const montserrat = Montserrat({ style: "normal", subsets: ["latin"], display: 'swap' });
export const raleway = Raleway({ weight: "200", style: "normal", subsets: ["latin"], display: 'swap' });
export const quantico = Quantico({ weight: "700", style: "normal", subsets: ["latin"], display: 'swap'});
