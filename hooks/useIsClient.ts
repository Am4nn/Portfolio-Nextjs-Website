import { useEffect, useState } from 'react';

export function useIsClient() {
  const [isClient, setClient] = useState<boolean>(false);

  // This effect runs only once after the initial render
  useEffect(() => {
    setClient(true);
  }, []);

  return isClient;
}
