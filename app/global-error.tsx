'use client'

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error]);

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        {/* Attempt to recover by trying to re-render the segment */}
        <button style={{
          border: '1px solid #ccc', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer'
        }} onClick={reset}>Try again</button>
      </body>
    </html>
  )
}