import React from 'react';
import { useIsClient, useWebGLDetection } from '@/hooks';
import { ReadOnlyChildren } from '@/utils/types';
import { toast } from "react-hot-toast";
import ErrorToast from '@/components/ui/Toasts/ErrorToast';

const WebGLWrapper: React.FC<ReadOnlyChildren> = ({ children }) => {
  const { isSupported, error } = useWebGLDetection();
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  // Handle the error if WebGL is not supported
  if (!isSupported) {
    toast.custom((t) => (
      <ErrorToast
        id={t.id}
        primaryMessage={error?.message}
        secondaryMessage="Please check your settings or try another browser"
      />
    ), {
      duration: 120000
    });

    // Can also use a fallback image when WebGL is not supported
    return null;
  }

  // Three.js functionality is not supported on your browser
  // Background graphics will not be displayed
  // Or use a fallback image when WebGL is not supported
  return children;
};

export default WebGLWrapper;
