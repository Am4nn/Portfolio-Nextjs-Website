import SocialNavIcons from "@/components/ui/NavIcons/NavIcons";
import styles from './Header.module.css';

const LeftSidebar: React.FC = () => (
  <div className={styles.leftSidebar}>
    <SocialNavIcons />
  </div>
);

export default LeftSidebar;
