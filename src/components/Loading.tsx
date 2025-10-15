import React from 'react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  fullScreen = false,
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-40 h-32',
    medium: 'w-56 h-48',
    large: 'w-72 h-64'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <img 
        src="/assests/loading.gif" 
        alt="Loading..." 
        className={`${sizeClasses[size]} opacity-60`}
      />
      {message && (
        <p className="mt-4 text-gray-600 text-center font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loading;
