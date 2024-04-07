import React from 'react'
import { useEffect, useState } from 'react';
import styles from './ScrollIndicator.module.css';
import Link from 'next/link';

const ScrollIndicator = ({ mountDelay = 0, href }: { mountDelay?: number, href: string }) => {
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState('true');
  const [scrollIndicatorIsMount, setScrollIndicatorIsMount] = useState(false);

  useEffect(() => {

    const hiddenId = setTimeout(() => setScrollIndicatorHidden('false'), (mountDelay - 1));
    const mountId = setTimeout(() => setScrollIndicatorIsMount(true), (mountDelay));

    const toggleAtTop = () => {
      const scrolled = document.documentElement.scrollTop;
      if (scrolled >= 20) setScrollIndicatorHidden('true');
      else if (scrolled < 20) setScrollIndicatorHidden('false');
    };
    window.addEventListener('scroll', toggleAtTop);

    return () => {
      clearTimeout(hiddenId);
      clearTimeout(mountId);
      window.removeEventListener('scroll', toggleAtTop);
    }
  }, [mountDelay]);

  return (
    <Link
      className={styles.scrollIndicator}
      data-hidden={scrollIndicatorIsMount ? scrollIndicatorHidden : 'true'}
      href={href}
      aria-label="Scroll to next section"
    />
  )
}

export default ScrollIndicator;
