/**
 * Creates a throttled version of the provided function that only invokes the function
 * at most once per every `timeFrame` milliseconds.
 *
 * @template T - The type of the function to throttle.
 * @param {T} func - The function to throttle.
 * @param {number} timeFrame - The number of milliseconds to wait before allowing the function to be called again.
 * @returns {(...args: Parameters<T>) => void} A throttled version of the provided function.
 *
 * @example
 * const throttledFunction = throttle(() => {
 *   console.log('Throttled function called');
 * }, 1000);
 *
 * window.addEventListener('resize', throttledFunction);
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  timeFrame: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return function (...args: Parameters<T>) {
    const now = new Date().getTime();

    if (now - lastTime >= timeFrame) {
      func(...args);
      lastTime = now;
    }
  };
}
