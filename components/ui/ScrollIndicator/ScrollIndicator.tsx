import React from 'react'
import styles from './ScrollIndicator.module.css';
import Link from 'next/link';
import useScrollIndicator from '@/hooks/useScrollIndicator';

interface ScrollIndicatorProps {
  mountDelay?: number;
  href: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ mountDelay = 0, href }) => {
  const { isHidden } = useScrollIndicator(mountDelay);

  return (
    <Link
      className={styles.scrollIndicator}
      data-hidden={isHidden}
      href={href}
      aria-label="Scroll to next section"
    />
  );
}

export default ScrollIndicator;
