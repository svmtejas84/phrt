import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageLoading = (delay: number = 500) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loading on route change
    setIsLoading(true);

    // Hide loading after delay to simulate page load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [location.pathname, delay]);

  return isLoading;
};
