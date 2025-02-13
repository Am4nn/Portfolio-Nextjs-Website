"use client"

import * as React from 'react';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from './Icons';
import { Switch } from '@nextui-org/react';

export default function ThemeSwitch() {
  const { setTheme, resolvedTheme } = useTheme();
  const [isSelected, setIsSelected] = React.useState(false);

  // checked -> dark mode
  // unchecked -> light mode
  // default -> dark mode

  React.useEffect(() => {
    setIsSelected(resolvedTheme === 'light');
  }, [resolvedTheme]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Switch
      isSelected={isSelected}
      onChange={toggleTheme}
      size="lg"
      color="success"
      startContent={<SunIcon />}
      endContent={<MoonIcon />}
      aria-label='Toggle theme'
    />
  );
}
