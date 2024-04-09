"use client"

import React, { useEffect, useState } from 'react'
import styles from './ScrollUpButton.module.css';

const ScrollUpButton = ({ element }: { element?: HTMLElement }) => {

  const [atTop, setAtTop] = useState<boolean>(true);

  const scrollHandler = () => {
    if (element) element.scrollTo(0, 0);
    else window.scrollTo(0, 0);
    // reset the hash in the URL
    window.location.hash = '';
  }

  useEffect(() => {
    const toggleAtTop = () => {
      const scrolled = element ? element.scrollTop : document.documentElement.scrollTop;
      if (scrolled > 100) setAtTop(false)
      else if (scrolled <= 100) setAtTop(true)
    };

    // for the first time when the component is mounted
    toggleAtTop();

    if (element) element.addEventListener('scroll', toggleAtTop);
    else window.addEventListener('scroll', toggleAtTop);
  }, [element]);

  return (
    <button aria-label='Scroll to the top' data-hidden={atTop} onClick={scrollHandler} className={[!atTop ? styles.show : "", styles.button].join(" ")}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <path
          fill="currentColor"
          d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z">
        </path>
      </svg>
    </button>
  )
}

export default ScrollUpButton;
