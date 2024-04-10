import Link from 'next/link';
import styles from './StyledLink.module.css';

interface StyledLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

const StyledLink = ({ href, external, children, ...rest }: StyledLinkProps) => {
  if (external) {
    return (
      <Link target="_blank" rel="noopener noreferrer" className={styles.link} href={href} {...rest}>
        {children}
      </Link>
    );
  } else {
    return (
      <Link className={styles.link} href={href} {...rest}>
        {children}
      </Link>
    );
  }
}

export default StyledLink;
