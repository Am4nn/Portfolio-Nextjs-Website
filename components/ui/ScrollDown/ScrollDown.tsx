import useScrollIndicator from '@/hooks/useScrollIndicator';
import styles from './ScrollDown.module.css';
import Link from 'next/link';

interface ScrollDownProps {
  /**
   * The delay in milliseconds before the component is mounted.
   */
  mountDelay?: number;

  /**
   * The href for the anchor tag
   */
  href: string;
}

const ScrollDown: React.FC<ScrollDownProps> = ({ mountDelay = 0, href }) => {
  const { isHidden } = useScrollIndicator(mountDelay);

  return (
    <Link
      className={styles.scrollIndicator}
      data-hidden={isHidden}
      href={href}
      aria-label="Scroll to next section"
    >
      <div className={styles.scrolldown}>
        <div className={styles.chevrons}>
          <div className={styles.chevrondown}></div>
          <div className={styles.chevrondown}></div>
        </div>
      </div>
    </Link>
  );
};

export default ScrollDown;
