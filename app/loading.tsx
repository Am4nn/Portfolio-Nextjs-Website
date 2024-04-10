import LoadingSpinner from "@/components/ui/LoadingSpinner/LoadingSpinner";

// You can add any UI inside Loading, including a Skeleton.
export default function Loading() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <LoadingSpinner />
    </div>
  )
}
