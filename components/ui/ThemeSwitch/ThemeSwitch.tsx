"use client"

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Box, IconButton } from '@mui/material';
// import { DarkMode as MoonIcon, LightMode as SunIcon } from '@mui/icons-material';
import { MoonIcon, SunIcon } from './Icons';
import Image from 'next/image';

export default function ThemeSwitch() {
  const [mounted, setMounted] = React.useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  React.useEffect(() => setMounted(true), [])

  // checked -> dark mode
  // unchecked -> light mode
  // default -> system mode

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Box sx={{
      position: 'fixed',
      zIndex: 1000,
      top: 5,
      right: 5
    }}>
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
        <IconButton id='theme-switch-button' aria-label='theme-switch-button' title='Theme Switch Button' sx={{ width: 50, height: 50, ml: 1 }} onClick={toggleTheme}>
          {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </IconButton>
      }
    </Box>
  );
}