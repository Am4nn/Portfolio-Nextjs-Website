import { useEffect, useRef, useState } from "react"

/**
 * Observes the size of an element.
 * @returns The element and its size.
 */
export function useObserveElement() {
  const scope = useRef<HTMLElement | any | null>(null);
  const [rect, setRect] = useState<DOMRectReadOnly>();

  useEffect(() => {
    if (scope.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        // We only have one entry, so we can use entries[0].
        const observedRect = entries[0].contentRect;
        setRect(observedRect);
      });

      resizeObserver.observe(scope.current)

      return () => {
        // Cleanup the observer when the component is unmounted
        resizeObserver.disconnect()
      }
    }
  }, []);

  return { scope, rect };
}
