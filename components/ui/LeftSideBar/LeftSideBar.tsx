"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@mui/material';
import { Icon } from '@/components/ui/Icons';
import { socialMediaDetails } from '@/utils/config';
import { cn } from '@/utils/cn';
import styles from './LeftSideBar.module.css';

const socialSideBarLoaderDelay = 0.3; // in seconds
const socialSideBarMountDelay = 500 + 1000; // in milliseconds

export function SocialSideBar() {
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767.5px)');

  useEffect(() => {
    if (isMobile) return;
    const timeout = setTimeout(() => setIsMounted(true), socialSideBarMountDelay);
    return () => clearTimeout(timeout);
  }, [isMobile]);

  if (isMobile) return null;
  return (
    <div className={cn(styles.StyledSideElement, styles.left)}>
      <AnimatePresence>
        {isMounted && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: socialSideBarLoaderDelay }}
            className={styles.StyledSocialList}
          >
            {socialMediaDetails && [{}, ...socialMediaDetails, {}].map(({ url, name }: { url?: string, name?: string }, i) => (
              <motion.li
                key={`social-icon-li-${i}`}
                initial={{ y: 20, opacity: 0, scale: 0.6, filter: "blur(20px)" }}
                animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: socialSideBarLoaderDelay, delay: i * 0.1 }}
              >
                {url ?
                  <Link href={url} aria-label={name} target="_blank" rel="noreferrer">
                    <Icon name={name} />
                  </Link> :
                  <div className={styles.bar} />
                }
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
};
