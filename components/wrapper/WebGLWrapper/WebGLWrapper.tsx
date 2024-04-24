import React from 'react';
import { useDelayedMount, useWebGLDetection } from '@/hooks';
import { ReadOnlyChildren } from '@/utils/types';

const WebGLWrapper: React.FC<ReadOnlyChildren> = ({ children }) => {
  const { isSupported, error } = useWebGLDetection();
  const isMounted = useDelayedMount(100);

  // In client only and Check if the browser supports WebGL
  if (!isMounted || !isSupported) {
    // Todo: add a toast notification, use error
    return null;
  }

  // Three.js functionality is not supported on your browser
  // Background graphics will not be displayed
  return children;
}

export default WebGLWrapper;
