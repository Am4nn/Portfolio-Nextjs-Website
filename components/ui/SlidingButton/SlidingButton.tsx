import { ReadOnlyChildren } from '@/utils/types'
import { cn } from '@/utils/cn';
import classes from './styles.module.css'

interface SlidingButtonType extends ReadOnlyChildren {
  text: Readonly<string>
};

const SlidingButton = ({ children, text }: SlidingButtonType) => {
  return (
    <button className={cn(classes.learnMore, classes.button)}>
      <span className={classes.circle} aria-hidden="true">
        <span className={cn(classes.icon, classes.arrow)}>
          {children}
        </span>
      </span>
      <span className={classes.buttonText}>{text}</span>
    </button>
  )
}

export default SlidingButton;
