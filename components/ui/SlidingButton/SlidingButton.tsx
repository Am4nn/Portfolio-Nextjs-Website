import React from 'react'
import classes from './styles.module.css'

const SlidingButton = ({ children, text }: { children?: React.ReactNode, text: string }) => {
  return (
    <button className={classes.learnMore + ' ' + classes.button}>
      <span className={classes.circle} aria-hidden="true">
        <span className={classes.icon + ' ' + classes.arrow}>
          {children}
        </span>
      </span>
      <span className={classes.buttonText}>{text}</span>
    </button>
  )
}

export default SlidingButton;
