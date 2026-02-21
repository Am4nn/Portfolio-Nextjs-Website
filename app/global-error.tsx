'use client'

import { useEffect } from "react"
import SomethingWentWrong from '@/components/ui/Error/SomethingWentWrong'

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
        <SomethingWentWrong
          title="Something went wrong"
          description="Sorry — something unexpected happened. You can try again or report this issue."
          error={error}
          reset={reset}
        />
      </body>
    </html>
  )
}