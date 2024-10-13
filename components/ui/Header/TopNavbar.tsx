import Logo from "@/components/ui/Logo/Logo";
import ThemeSwitch from "@/components/ui/ThemeSwitch/ThemeSwitch";
import styles from './Header.module.css';

const Right = "div";

const TopNavbar: React.FC = () => (
  <div className={styles.topNavbar}>
    <Logo />

    <Right>
      <ThemeSwitch />
    </Right>
  </div>
);

export default TopNavbar;
