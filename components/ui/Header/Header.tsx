"use client"

import Logo from "@/components/ui/Logo/Logo";
import SocialNavIcons from "@/components/ui/NavIcons/NavIcons";
import ThemeSwitch from "@/components/ui/ThemeSwitch/ThemeSwitch";
import ScrollUpButton from "@/components/ui/ScrollUpButton/ScrollUpButton";
import { cn } from '@/utils/cn';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={cn(styles.alignment, styles.header)}>
      <ThemeSwitch />
      <Logo />
      <SocialNavIcons />
      <ScrollUpButton />
    </header>
  )
}
