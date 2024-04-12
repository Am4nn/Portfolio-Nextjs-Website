import { forwardRef } from 'react';
import styles from './VisuallyHidden.module.css';
import { cn } from '@/utils/cn';
import { ReadOnlyChildren } from '@/utils/types';

export interface VisuallyHiddenProps extends ReadOnlyChildren {
  className?: string[];
  showOnFocus?: boolean;
  as?: React.ElementType;
  visible?: boolean;
}

const VisuallyHidden = forwardRef<HTMLButtonElement, Readonly<VisuallyHiddenProps>>((
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
