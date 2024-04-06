"use client";
import React, { useState, useEffect } from 'react'
import { useMediaQuery } from '@mui/material';
import { Icon } from '@/components/ui/Icons';
import { socialMediaDetails } from '@/utils/config';
import styles from './LeftSideBar.module.css';

const mountDelay = 600 + 1000;
const loaderDelay = 1000;
const animationClass = "fadeup";

const LeftBottomSide = ({ children }: { children: React.ReactNode }) => (
  <div className={[styles.StyledSideElement, styles.left].join(" ")}>
    {children}
  </div>
);

export function SocialSideBar() {

  const [isMounted, setIsMounted] = useState(false);

  const isMobile = useMediaQuery('(max-width: 767.5px)');

  useEffect(() => {
    if (isMobile) return;
    const timeout = setTimeout(() => setIsMounted(true), mountDelay);
    return () => clearTimeout(timeout);
  }, [isMobile]);

  if (isMobile) return null;
  return (
    <LeftBottomSide>
      <ul className={styles.StyledSocialList}>
        {socialMediaDetails && [{}, ...socialMediaDetails, {}].map(({ url, name }: { url?: string, name?: string }, i) => (
          <li key={`social-icon-li-${i}`}>
            {url ?
              <a href={url} aria-label={name} target="_blank" rel="noreferrer">
                <Icon name={name} />
              </a>
              : <div className={styles.bar} style={{ transitionDelay: `${i + 1}00ms` }} />
            }
          </li>
        ))}
      </ul>
    </LeftBottomSide>
  )
};
