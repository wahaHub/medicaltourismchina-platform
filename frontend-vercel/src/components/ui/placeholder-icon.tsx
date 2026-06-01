import React from 'react';

interface PlaceholderIconProps {
  className?: string;
  size?: number;
}

const PlaceholderIcon: React.FC<PlaceholderIconProps> = ({ className = "", size = 24 }) => {
  return (
    <div 
      className={`bg-gray-300 rounded ${className}`} 
      style={{ width: size, height: size }}
    />
  );
};

export default PlaceholderIcon;