import { useEffect, useMemo, useState } from 'react';
import { useLoading } from '../contexts/loadingProvider';

enum ColorScheme {
  Light = 'light',
  Dark = 'dark',
}

const breakpoints = {
  '2xs': 320,
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const isWindowReady = typeof window !== 'undefined';

export function useWindowParam() {
  const { isLoading } = useLoading();

  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: -1,
    height: -1,
  });
  const [windowPosition, setWindowPosition] = useState({
    top: -1,
    left: -1,
  });
  const [colorScheme, setColorScheme] = useState(ColorScheme.Light);
  const [isOnline, setIsOnline] = useState(true);
  const isReady = useMemo(() => windowSize.width > 0 && !isLoading, [windowSize.width, isLoading]);

  const breakpointsReached = useMemo(
    () => ({
      is2xs: windowSize.width > 0 && windowSize.width <= breakpoints['2xs'],
      isXs: windowSize.width > 0 && windowSize.width <= breakpoints.xs,
      isSm: windowSize.width > 0 && windowSize.width <= breakpoints.sm,
      isMd: windowSize.width > 0 && windowSize.width <= breakpoints.md,
      isLg: windowSize.width > 0 && windowSize.width <= breakpoints.lg,
      isXl: windowSize.width > 0 && windowSize.width <= breakpoints.xl,
      is2xl: windowSize.width > 0 && windowSize.width <= breakpoints['2xl'],
    }),
    [windowSize.width],
  );

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setWindowPosition({
        top: window.screenTop,
        left: window.screenLeft,
      });
    };
    const handleColorScheme = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? ColorScheme.Dark : ColorScheme.Light);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleColorScheme);
    window.addEventListener('online', () => setIsOnline(true), false);
    window.addEventListener('offline', () => setIsOnline(false), false);

    // Call handler right away so state gets updated with initial window size
    handleResize();
    setColorScheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? ColorScheme.Dark : ColorScheme.Light);
    setIsOnline(window.navigator.onLine);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleColorScheme);
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []); // Empty array ensures that effect is only run on mount

  useEffect(() => {
    document.documentElement.className = colorScheme;
  }, [colorScheme]);

  return {
    width: windowSize.width,
    height: windowSize.height,
    top: windowPosition.top,
    left: windowPosition.left,
    isDark: colorScheme === ColorScheme.Dark,
    isOnline,
    isReady,
    breakpoints: breakpointsReached,
  };
}
