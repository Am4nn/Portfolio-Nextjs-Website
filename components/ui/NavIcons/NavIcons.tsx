"use client"

import React from 'react'
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks';
import VisuallyHidden from '@/components/wrapper/VisuallyHidden/VisuallyHidden';
import { Icon } from '@/components/ui/Icons';
import { useDelayedMount } from '@/hooks';
import { socialMediaDetails } from '@/utils/config';
import styles from './NavIcons.module.css';

// in milliseconds
const socialSideBarMountDelay = 500 + 1000;

const fadeInAnimationVariants = {
  initial: { y: 20, opacity: 0, scale: 0.6, filter: "blur(20px)" },
  animate: (index: number) => ({
    y: 0, opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.3, delay: index * 0.1 }
  })
}

export default function SocialNavIcons() {
  const isMounted = useDelayedMount(socialSideBarMountDelay);
  const isMobile = useMediaQuery('(max-width: 767.5px)');

  return (
    <AnimatePresence>
      {(!isMobile && isMounted) ? <NavIcons /> : <HiddenNavIcons />}
    </AnimatePresence>
  );
}

const NavIcons = () => (
  <ul className={styles.StyledSocialList}>
    {socialMediaDetails && socialMediaDetails.map(({ url, name }, index) => (
      <motion.li
        key={index}
        variants={fadeInAnimationVariants}
        initial="initial"
        animate="animate"
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
