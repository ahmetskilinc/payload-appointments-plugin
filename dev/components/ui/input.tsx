import * as React from 'react'

import { cn } from '../../lib/utils'

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
        'flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
}
Input.displayName = 'Input'

export { Input }
