import { cn } from '@/utils/cn';
import styles from './StyledButton.module.css';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export default function StyledButton({ children, className, startIcon, endIcon, ...rest }: StyledButtonProps) {
  return (
    <button className={cn(styles.button, className)} {...rest}>
      <div className={styles.wrapper}>
        {startIcon && <span>{startIcon}</span>}
        <span>{children}</span>
        {endIcon && <span>{endIcon}</span>}
      </div>
    </button>
  );
}
