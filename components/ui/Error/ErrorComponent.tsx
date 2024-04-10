import Link from 'next/link';
import SlidingButton from '@/components/ui/SlidingButton/SlidingButton';
import { statusCodes } from '@/utils/status-codes';
import { montserrat } from '@/utils/fonts';
import { cn } from '@/utils/cn';
import Ghost from './Ghost';
import classes from './styles.module.css';

const ErrorComponent = ({ code }: { code: string }) => {
  const message = statusCodes[code];
  return (
    <section className={cn(montserrat.className, classes.section)}>
      <main className={classes.section}>
        <h1 className={classes.h1}>
          {code[0]}
          <span className={classes.span}>
            <Ghost />
          </span>
          {code[2]}
        </h1>
        <h2 className={classes.h2}>Error <span>{code}</span> : {message}</h2>
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
