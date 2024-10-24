"use client"

import React from 'react'
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import VisuallyHidden from '@/components/wrapper/VisuallyHidden/VisuallyHidden';
import { Icon } from '@/components/ui/Icons';
import { useDelayedMount, useMediaQuery } from '@/hooks';
import { socialMediaDetails } from '@/utils/config';
import { cn } from '@/utils/cn';
import { Code } from '@nextui-org/react';
import styles from './NavIcons.module.css';
import { NAV_ICONS_LOAD_DELAY, NAV_ICONS_LOAD_DURATION } from '@/utils/timing';

const fadeInAnimationVariants = {
  initial: { y: 20, opacity: 0, scale: 0.6, filter: "blur(20px)" },
  animate: (index: number) => ({
    y: 0, opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: NAV_ICONS_LOAD_DURATION, delay: index * 0.1 }
  })
}

export default function NavIcons() {
  const isMounted = useDelayedMount(NAV_ICONS_LOAD_DELAY);
  const isMobile = useMediaQuery('(max-width: 767.5px)');

  return (
    <AnimatePresence>
      {
        !isMounted ? <HiddenNavIcons /> :
          isMobile ? <AnimatedNavIconsMobile /> :
            <AnimatedNavIconsDesktop />
      }
    </AnimatePresence>
  );
}

const AnimatedNavIconsMobile = () => (
  <Code className={styles.listPosition}>
    <AnimatedNavIcons />
  </Code>
);

const AnimatedNavIconsDesktop = () => (
  <AnimatedNavIcons className={styles.listPosition} />
);

const AnimatedNavIcons: React.FC<{ className?: string }> = ({ className }) => (
  <ul className={cn(className, styles.list)}>
    {socialMediaDetails && socialMediaDetails.map(({ url, name }, index) => (
      <motion.li
        key={index}
        variants={fadeInAnimationVariants}
        initial="initial"
        animate="animate"
        exit="initial"
        custom={index}
      >
        <Link href={url} aria-label={name} target="_blank" rel="noreferrer">
          <Icon name={name} />
        </Link>
      </motion.li>
    ))}
  </ul>
);

const HiddenNavIcons = () => (
  <VisuallyHidden>
    <ul>
      {socialMediaDetails && socialMediaDetails.map(({ url, name }, index) => (
        <li key={index}>
          <Link href={url} aria-label={name} target="_blank" rel="noreferrer">
            {name}
          </Link>
        </li>
      ))}
    </ul>
  </VisuallyHidden>
);
