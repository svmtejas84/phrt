import React, { Suspense } from 'react';
import Loading from './Loading';

interface RouteLoaderProps {
  children: React.ReactNode;
}

const RouteLoader: React.FC<RouteLoaderProps> = ({ children }) => {
  return (
    <Suspense fallback={<Loading fullScreen message="Loading page..." />}>
      {children}
    </Suspense>
  );
};

export default RouteLoader;
