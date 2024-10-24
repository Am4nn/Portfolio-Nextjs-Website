import { useEffect, useState } from 'react';

/**
 * Checks if the code is running on the client.
 * @returns Whether the code is running on the client.
 */
export function useIsClient() {
  const [isClient, setClient] = useState<boolean>(false);

  // This effect runs only once after the initial render
  useEffect(() => {
    setClient(true);
  }, []);

  return isClient;
}
