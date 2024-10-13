"use client"

import { cn } from '@/utils/cn';
import styles from './Header.module.css';
import TopNavbar from './TopNavbar';
import LeftSidebar from './LeftSidebar';

const Header: React.FC = () => (
  <header className={cn(styles.alignment, styles.header)}>
    <TopNavbar />
    <LeftSidebar />
  </header>
);

export default Header;
