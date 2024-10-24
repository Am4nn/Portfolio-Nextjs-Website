import { useEffect, useState } from 'react';

/**
 * Observes whether an element is in the viewport.
 * @param elementRef The element to observe.
 * @param unobserveOnIntersect Whether to unobserve the element when it intersects.
 * @param options The options for the IntersectionObserver.
 * @param shouldObserve Whether to observe the element.
 * @returns Whether the element is in the viewport.
 */
export function useInViewport(
  elementRef: React.RefObject<HTMLElement | HTMLCanvasElement | undefined>,
  unobserveOnIntersect: boolean = false,
  options = {},
  shouldObserve = true
) {
  const [intersect, setIntersect] = useState(false);
  const [isUnobserved, setIsUnobserved] = useState(false);

  useEffect(() => {
    if (!elementRef?.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      const { isIntersecting, target } = entry;

      setIntersect(isIntersecting);

      if (isIntersecting && unobserveOnIntersect) {
        observer.unobserve(target);
        setIsUnobserved(true);
      }
    }, options);

    if (!isUnobserved && shouldObserve) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [elementRef, unobserveOnIntersect, options, isUnobserved, shouldObserve]);

  return intersect;
}
