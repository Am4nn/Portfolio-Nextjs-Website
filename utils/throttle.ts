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
