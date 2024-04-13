import Link from 'next/link';
import styles from './StyledLink.module.css';

interface StyledLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  external?: boolean;
}

export default function StyledLink({ href, external, children, ...rest }: StyledLinkProps) {
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

  return (
    <Link className={styles.link} {...linkProps} href={href} {...rest}>
      {children}
    </Link>
  );
}
