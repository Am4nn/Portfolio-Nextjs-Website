import Link from 'next/link';
import styles from './StyledLink.module.css';

interface StyledLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const StyledLink = ({ href, children, ...rest }: StyledLinkProps) => (
  <Link className={styles.link} href={href} {...rest}>
    {children}
  </Link>
);

export default StyledLink;
