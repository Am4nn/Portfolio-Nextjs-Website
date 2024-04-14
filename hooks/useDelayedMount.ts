import { useEffect, useState } from "react";

export function useDelayedMount(delay: number = 0) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return isMounted;
}
