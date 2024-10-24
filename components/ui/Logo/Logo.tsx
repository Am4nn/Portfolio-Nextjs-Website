"use client"

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { LOGO_LOAD_DELAY, LOGO_LOAD_DURATION } from '@/utils/timing';

interface LogoProps {
  width?: number | string;
  height?: number | string;
  transitionDuration?: number;
  startDelay?: number;
  href?: string;
}

const handleScrollReset = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  event.preventDefault();
  window.scrollTo(0, 0);
  window.location.hash = '';
}

const Logo = ({ width = 36, height = 36, transitionDuration = LOGO_LOAD_DURATION, startDelay = LOGO_LOAD_DELAY, href = '/' }: LogoProps) => (
  <Link aria-label='Portfolio Icon' href={href} onClick={handleScrollReset}>
    <motion.svg
      className="text-foreground hover:text-foreground_secondary transition-colors duration-300"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0.00 0.00 234.00 203.00"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: transitionDuration, ease: "easeInOut", delay: startDelay }}
    >
      <motion.path
        initial={{ translateX: '-20px', translateY: 0 }}
        animate={{ translateX: 0, translateY: 0 }}
        transition={{ duration: transitionDuration, ease: "easeInOut", delay: transitionDuration + startDelay - 0.1 }}
        fill="currentColor"
        d="M 122.18 182.11
         C 133.68 182.63 146.17 181.54 139.07 165.45
         Q 108.84 96.86 100.79 76.95
         C 91.54 54.07 104.07 35.87 114.28 14.28
         A 0.56 0.55 -44.3 0 1 115.29 14.29
         Q 146.50 85.12 177.85 156.15
         C 181.99 165.54 187.89 179.95 199.11 181.69
         C 201.75 182.10 203.61 183.28 202.61 186.14
         A 0.89 0.88 -80.1 0 1 201.78 186.73
         L 122.17 187.08
         A 0.67 0.66 0.0 0 1 121.50 186.42
         L 121.50 182.76
         A 0.65 0.65 0.0 0 1 122.18 182.11
         Z"
      />
      <motion.path
        initial={{ translateX: '67px', translateY: '-62px', scale: 0.75 }}
        animate={{ translateX: 0, translateY: 0, scale: 1 }}
        transition={{ duration: transitionDuration, ease: "easeInOut", delay: transitionDuration + startDelay - 0.1 }}
        fill="currentColor"
        d="M 69.88 181.12
         C 71.53 181.45 83.44 181.26 80.48 185.86
         A 1.92 1.91 16.2 0 1 78.89 186.73
         L 25.50 187.09
         Q 24.91 187.10 24.88 186.51
         L 24.70 183.39
         Q 24.67 182.86 25.15 182.65
         C 26.57 182.01 28.34 181.58 29.54 181.07
         Q 41.37 176.01 46.32 164.30
         C 49.84 156.01 51.61 147.92 62.76 149.16
         A 1.30 1.30 0.0 0 1 63.75 151.08
         C 57.85 161.62 52.51 177.69 69.88 181.12
         Z"
      />
    </motion.svg>
  </Link>
);

export default Logo;
