import React from 'react'
import classes from './styles.module.css'
import Ghost from './Ghost'
import Link from 'next/link'
import SlidingButton from '@/components/ui/SlidingButton/SlidingButton'
import { statusCodes } from '@/utils/status-codes'

const ErrorComponent = ({ code }: { code: string }) => {
  const message = statusCodes[code];
  return (
    <section className={classes.section}>
      <main className={classes.section}>
        <h1 className={classes.h1}>
          {code[0]}
          <span className={classes.span}>
            <Ghost />
          </span>
          {code[2]}
        </h1>
        <h2 className={classes.h2}>Error <span>{message}</span> : {message}</h2>
        <p className={classes.p}>Sorry, the page you’re looking for cannot be accessed</p>

        <div className={classes.containerx}>
          <Link href='/' className={classes.link}>
            <SlidingButton text='Home Page' />
          </Link>
        </div>
      </main>
    </section >
  )
}

export default ErrorComponent;
