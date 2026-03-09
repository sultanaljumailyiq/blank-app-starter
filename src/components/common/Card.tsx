import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  onClick,
  hover = false
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-md p-4 transition-all duration-200',
        hover && 'hover:shadow-lg hover:scale-[1.02] cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
