import { useEffect, useRef, useState } from 'react';
import { WebGLRenderer } from 'three';

export interface WebGLDetectionResult {
  isSupported: boolean;
  error?: Error;
}

/**
 * Detects whether WebGL is supported on the client.
 * @returns Whether WebGL is supported and an error if it is not.
 */
export function useWebGLDetection(): WebGLDetectionResult {
  const isSupported = useRef(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    // Create canvas element. The canvas is not added to the document itself, 
    // so it is never displayed in the browser window
    const canvas = document.createElement("canvas");

    // Get WebGLRenderingContext from canvas element
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    let renderer: WebGLRenderer | null | undefined = null;

    try {
      // Create a WebGLRenderer instance
      renderer = new WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true,
      });
    } catch {
      renderer = null;
    }

    if (gl !== null && gl !== undefined && gl instanceof WebGLRenderingContext &&
      renderer !== null && renderer !== undefined && renderer instanceof WebGLRenderer) {
      isSupported.current = true;
    } else {
      setError(new Error('WebGL is not supported on your browser'));
    }

    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };

  }, []);

  return { isSupported: isSupported.current, error };
}
