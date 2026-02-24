import { useEffect, useState } from 'react';

// Hook to get the current screen size
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | null>(null);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;

      if (width < 640) setScreenSize('xs');
      else if (width >= 640 && width < 768) setScreenSize('sm');
      else if (width >= 768 && width < 1024) setScreenSize('md');
      else if (width >= 1024 && width < 1280) setScreenSize('lg');
      else if (width >= 1280 && width < 1536) setScreenSize('xl');
      else setScreenSize('2xl');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Component to render different content based on screen size
export const ResponsiveComponent = ({
  xs, sm, md, lg, xl, defaultComponent
}: {
  xs?: React.ReactNode;
  sm?: React.ReactNode;
  md?: React.ReactNode;
  lg?: React.ReactNode;
  xl?: React.ReactNode;
  defaultComponent: React.ReactNode;
}) => {
  const screenSize = useScreenSize();

  if (!screenSize) return defaultComponent;

  switch (screenSize) {
    case 'xs':
      return xs || defaultComponent;
    case 'sm':
      return sm || defaultComponent;
    case 'md':
      return md || defaultComponent;
    case 'lg':
      return lg || defaultComponent;
    case 'xl':
      return xl || defaultComponent;
    case '2xl':
      return defaultComponent;
    default:
      return defaultComponent;
  }
};