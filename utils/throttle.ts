/**
 * Creates a throttled version of the provided function that only invokes the function
 * at most once per every `timeFrame` milliseconds. Optionally, ensures the last invocation
 * is executed after the delay.
 *
 * @template T - The type of the function to throttle.
 * @param {T} func - The function to throttle.
 * @param {number} timeFrame - The number of milliseconds to wait before allowing the function to be called again.
 * @param {boolean} trailing - Whether to execute the function one last time after the delay.
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
  timeFrame: number,
  trailing = false
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    const now = new Date().getTime();

    if (now - lastTime >= timeFrame) {
      func(...args);
      lastTime = now;
    } else if (trailing && !timeout) {
      timeout = setTimeout(() => {
        func(...args);
        lastTime = new Date().getTime();
        timeout = null;
      }, timeFrame - (now - lastTime));
    }
  };
}
