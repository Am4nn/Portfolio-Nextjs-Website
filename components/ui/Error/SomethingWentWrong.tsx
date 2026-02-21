"use client"

import React from "react"

type Props = {
  title?: string
  description?: string
  error?: Error
  reset?: () => void
}

export default function SomethingWentWrong({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Try reloading or come back later.',
  error,
  reset,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 dark:from-indigo-500 dark:to-purple-600 flex items-center justify-center text-white text-2xl">⚠️</div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}.</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>

            {error?.message && (
              <details className="mt-3 text-xs text-slate-500 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="whitespace-pre-wrap mt-2 text-[0.78rem] text-slate-700 dark:text-slate-200">{error.message}</pre>
              </details>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Try again
              </button>

              <a
                href={`mailto:125aryaaman@gmail.com?subject=App%20Error&body=${encodeURIComponent(error?.message || '')}`}
                className="inline-flex items-center px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Report
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
