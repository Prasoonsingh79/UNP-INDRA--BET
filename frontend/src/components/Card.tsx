import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`glass-panel ${className}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', padding: '16px', borderRadius: '12px' }}
    >
      {children}
    </div>
  );
};

export default Card;
