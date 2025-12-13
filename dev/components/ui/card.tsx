import * as React from 'react'

import { cn } from '../../lib/utils'

const Card = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLDivElement | null> } & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50',
      className,
    )}
    ref={ref}
    {...props}
  />
)
Card.displayName = 'Card'

const CardHeader = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLDivElement | null> } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} ref={ref} {...props} />
)
CardHeader.displayName = 'CardHeader'

const CardTitle = ({
  className,
  ref,
  ...props
}: {
  ref?: React.RefObject<HTMLParagraphElement | null>
} & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    ref={ref}
    {...props}
  >
    {props.children}
  </h3>
)
CardTitle.displayName = 'CardTitle'

const CardDescription = ({
  className,
  ref,
  ...props
}: {
  ref?: React.RefObject<HTMLParagraphElement | null>
} & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('text-sm text-neutral-500 dark:text-neutral-400', className)}
    ref={ref}
    {...props}
  />
)
CardDescription.displayName = 'CardDescription'

const CardContent = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLDivElement | null> } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} ref={ref} {...props} />
)
CardContent.displayName = 'CardContent'

const CardFooter = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLDivElement | null> } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-6 pt-0', className)} ref={ref} {...props} />
)
CardFooter.displayName = 'CardFooter'

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
