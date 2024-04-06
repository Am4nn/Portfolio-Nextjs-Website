import { forwardRef } from 'react';
import styles from './VisuallyHidden.module.css';
import { cn } from '@/utils/cn';

export interface VisuallyHiddenProps {
  className?: string[];
  showOnFocus?: boolean;
  as?: React.ElementType;
  children?: React.ReactNode;
  visible?: boolean;
}

const VisuallyHidden = forwardRef<HTMLButtonElement, VisuallyHiddenProps>((
  { className = [], showOnFocus = false, as: Component = 'span', children, visible = false, ...rest },
  ref: React.ForwardedRef<HTMLButtonElement>
) => (
  <Component
    className={cn(styles['visually-hidden'], ...className)}
    data-hidden={!visible && !showOnFocus}
    data-show-on-focus={showOnFocus}
    ref={ref}
    {...rest}
  >
    {children}
  </Component>
));

VisuallyHidden.displayName = 'VisuallyHidden';

export default VisuallyHidden;
