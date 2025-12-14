import * as React from 'react';

import { cn } from '../../lib/utils';

const Card = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLDivElement | null> } & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-2xl border border-gray-100/80 bg-white/90 backdrop-blur-sm text-gray-900 shadow-xl shadow-gray-900/5',
      className,
    )}
    ref={ref}
    {...props}
  />
);
Card.displayName = 'Card';

const CardHeader = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLDivElement | null> } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} ref={ref} {...props} />
);
CardHeader.displayName = 'CardHeader';

const CardTitle = ({
  className,
  ref,
  ...props
}: {
  ref?: React.RefObject<HTMLParagraphElement | null>;
} & React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-2xl font-bold leading-none tracking-tight text-gray-900', className)}
    ref={ref}
    {...props}
  >
    {props.children}
  </h3>
);
CardTitle.displayName = 'CardTitle';

const CardDescription = ({
  className,
  ref,
  ...props
}: {
  ref?: React.RefObject<HTMLParagraphElement | null>;
} & React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-gray-500', className)} ref={ref} {...props} />
);
CardDescription.displayName = 'CardDescription';

const CardContent = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLDivElement | null> } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} ref={ref} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLDivElement | null> } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center p-6 pt-0', className)} ref={ref} {...props} />
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
