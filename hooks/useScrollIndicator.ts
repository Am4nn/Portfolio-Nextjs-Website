import { useEffect, useState } from 'react';

/**
 * Hides the scroll indicator when the user scrolls down and shows it when the user scrolls up.
 * @param mountDelay The delay in seconds before mounting the scroll indicator.
 * @param scrollThreshold The scroll threshold in pixels before hiding the scroll indicator.
 * @returns Whether the scroll indicator is hidden.
 */
const useScrollIndicator = (mountDelay = 0, scrollThreshold = 20) => {
  const [scrollIndicatorHidden, setScrollIndicatorHidden] = useState(true);
  const [scrollIndicatorIsMount, setScrollIndicatorIsMount] = useState(false);

  useEffect(() => {

    const hiddenId = setTimeout(() => setScrollIndicatorHidden(false), (mountDelay));
    const mountId = setTimeout(() => setScrollIndicatorIsMount(true), (mountDelay + 1));

    const toggleAtTop = () => {
      const scrolled = document.documentElement.scrollTop;
      if (scrolled >= scrollThreshold) setScrollIndicatorHidden(true);
      else if (scrolled < scrollThreshold) setScrollIndicatorHidden(false);
    };

    window.addEventListener('scroll', toggleAtTop);

    return () => {
      clearTimeout(hiddenId);
      clearTimeout(mountId);
      window.removeEventListener('scroll', toggleAtTop);
    }
  }, [mountDelay, scrollThreshold]);

  return { isHidden: scrollIndicatorIsMount ? scrollIndicatorHidden : true };
};

export default useScrollIndicator;
