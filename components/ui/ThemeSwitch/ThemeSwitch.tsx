"use client"

import * as React from 'react';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from './Icons';
import Image from 'next/image';
import { useDelayedMount } from '@/hooks';
import styles from './ThemeSwitch.module.css';

export default function ThemeSwitch() {
  const mounted = useDelayedMount(500);
  const { setTheme, resolvedTheme } = useTheme();

  // checked -> dark mode
  // unchecked -> light mode
  // default -> system mode

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div>
      {!mounted ?
        // to handle server-side rendering and avoid content layout shift, not mounted -> server-side rendering
        <Image
          src="data:image/svg+xml;base64,PHN2ZyBzdHJva2U9IiNGRkZGRkYiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIyIiB5PSIyIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSIyIj48L3JlY3Q+PC9zdmc+Cg=="
          width={36}
          height={36}
          sizes="36x36"
          alt="Loading Light/Dark Toggle"
          priority={false}
          title="Loading Light/Dark Toggle"
          style={{ opacity: 0 }}
          aria-label='loading-theme-switch-button'
        />
        :
        <button
          title='Theme Switch Button'
          aria-label='theme-switch-button'
          className={styles.themeSwitchButton}
          onClick={toggleTheme}
        >
          {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>
      }
    </div>
  );
}
