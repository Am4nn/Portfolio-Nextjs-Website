"use client"

import Link from 'next/link'
import SlidingButton from '@/components/ui/SlidingButton/SlidingButton'
import { statusCodes } from '@/utils/status-codes'
import { montserrat } from '@/utils/fonts'
import Ghost from './Ghost'

const ErrorComponent = ({ code }: { code: string }) => {
  const message = statusCodes[code]
  return (
    <section className={`${montserrat.className} min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800`}>
      <main className="max-w-3xl w-full bg-white/80 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-6">
          <div className="text-6xl font-extrabold text-slate-900 dark:text-white flex items-center">
            {code[0]}
            <span className="mx-3 flex items-center"><Ghost animated size="1.4em" /></span>
            {code[2]}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Error <span className="text-indigo-600 dark:text-indigo-400">{code}</span> : {message}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sorry — the page you’re looking for cannot be accessed.</p>

            <div className="mt-4 flex items-center gap-3">
              <Link href="/" className="inline-flex">
                <SlidingButton text="Home Page" />
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      </main>
    </section>
  )
}

export default ErrorComponent
