import React from 'react';
import { useIsClient, useWebGLDetection } from '@/hooks';
import { ReadOnlyChildren } from '@/utils/types';
import { toast } from "react-hot-toast";

const WebGLWrapper: React.FC<ReadOnlyChildren> = ({ children }) => {
  const { isSupported, error } = useWebGLDetection();
  const isClient = useIsClient();

  // In client only and Check if the browser supports WebGL
  if (!isClient || !isSupported) {
    // Todo: some fallback graphics
    toast.error("WebGL is not supported on your browser. Please try a different browser or update your current one.");
    return null;
  }

  // Three.js functionality is not supported on your browser
  // Background graphics will not be displayed
  // Or use a fallback image when WebGL is not supported
  return children;
};

export default WebGLWrapper;
