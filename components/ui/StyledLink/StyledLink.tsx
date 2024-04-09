import Link from 'next/link';
import styles from './StyledLink.module.css';

type StyledLinkProps = {
  href: string;
  children: React.ReactNode;
};

const StyledLink = ({ href, children }: StyledLinkProps) => (
  <Link className={styles.link} href={href}>
    {children}
  </Link>
);

export default StyledLink;
