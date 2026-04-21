import React from 'react';
import { cn } from '@/ui/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    
    const variantClass = {
      default: 'bg-[#151515] border border-white/5',
      glass: 'bg-white/5 backdrop-blur-md border border-white/10',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn("rounded-xl shadow-lg flex flex-col", variantClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
