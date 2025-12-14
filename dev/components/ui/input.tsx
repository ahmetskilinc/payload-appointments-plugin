import * as React from 'react';

import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = ({
  type,
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLInputElement | null> } & InputProps) => {
  return (
    <input
      className={cn(
        'flex h-12 w-full rounded-xl border-2 border-gray-100 bg-white px-4 py-3 text-sm text-gray-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-gray-400 focus-visible:ring-4 focus-visible:ring-gray-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
};
Input.displayName = 'Input';

export { Input };
