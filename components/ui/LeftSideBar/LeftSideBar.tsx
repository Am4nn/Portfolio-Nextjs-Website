"use client"

import React from 'react'
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@mui/material';
import { Icon } from '@/components/ui/Icons';
import { socialMediaDetails } from '@/utils/config';
import { cn } from '@/utils/cn';
import styles from './LeftSideBar.module.css';
import { useDelayedMount } from '@/hooks';

// in milliseconds
const socialSideBarMountDelay = 500 + 1000;

const fadeInAnimationVariants = {
  initial: { y: 20, opacity: 0, scale: 0.6, filter: "blur(20px)" },
  animate: (index: number) => ({
    y: 0, opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.3, delay: index * 0.1 }
  })
}

export function SocialSideBar() {
  const isMounted = useDelayedMount(socialSideBarMountDelay);
  const isMobile = useMediaQuery('(max-width: 767.5px)');

  return (
    <AnimatePresence>
      {(!isMobile && isMounted) ? <LeftSideBar /> : null}
    </AnimatePresence>
  )
}

const LeftSideBar = () => (
  <div className={cn(styles.StyledSideElement, styles.left)}>
    <ul className={styles.StyledSocialList}>
      {socialMediaDetails && [{}, ...socialMediaDetails, {}].map(({ url, name }: { url?: string, name?: string }, index) => (
        <motion.li
          key={index}
          variants={fadeInAnimationVariants}
          initial="initial"
          animate="animate"
          custom={index}
        >
          {url ?
            <Link href={url} aria-label={name} target="_blank" rel="noreferrer">
              <Icon name={name} />
            </Link> :
            <div className={styles.bar} />
          }
        </motion.li>
      ))}
    </ul>
  </div>
)
