'use client' // Error components must be Client Components

import { useEffect } from 'react'
import SomethingWentWrong from '@/components/ui/Error/SomethingWentWrong'

export default function Error({
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
    <SomethingWentWrong
      title="Something went wrong"
      description="An unexpected error occurred. Click try again to attempt recovery."
      error={error}
      reset={reset}
    />
  )
}