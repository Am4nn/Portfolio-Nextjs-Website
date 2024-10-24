import { useEffect, useState } from "react";

/**
 * Delays the mounting of a component by a specified amount of time.
 * @param delay The delay in seconds.
 * @returns Whether the component has been mounted.
 */
export function useDelayedMount(delay: number = 0) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  return isMounted;
}
