import { useCallback, useEffect, useRef } from 'react';

const HISTORY_LENGTH = 9;

/**
 * Measures the frames per second of the browser.
 * @param running Whether the fps should be measured.
 * @returns The fps, whether the fps is low, and a function to measure the fps.
 */
export function useFps(running = true) {
  const fps = useRef(0);
  const prevTime = useRef(0);
  const frames = useRef(0);
  const frameHistory = useRef<number[]>([]);
  const isLowFps = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    prevTime.current = performance.now();
    frames.current = 0;
    frameHistory.current = [];
  }, [running]);

  const measureFps = useCallback(() => {
    const currentTime = performance.now();
    frames.current++;

    // Measure fps every 200ms to reduce overhead
    if (currentTime >= prevTime.current + 200) {
      fps.current = (frames.current * 1000) / (currentTime - prevTime.current);
      frameHistory.current.push(fps.current);
      prevTime.current = currentTime;
      frames.current = 0;
    }

    if (frameHistory.current.length > HISTORY_LENGTH) {
      frameHistory.current = frameHistory.current.slice(-HISTORY_LENGTH);
    }

    // Below 50 is considered low fps
    isLowFps.current = frameHistory.current.every(item => item < 50);
  }, []);

  return { measureFps, fps, isLowFps };
}
