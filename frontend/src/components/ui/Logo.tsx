import React from 'react';
import { Twitter } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 24, className = "" }) => {
  return (
    <Twitter 
      size={size} 
      className={`text-blue-500 ${className}`} 
    />
  );
};

export default Logo;