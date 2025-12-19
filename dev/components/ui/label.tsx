import * as React from 'react';

import { cn } from '../../lib/utils';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({
  className,
  ref,
  ...props
}: { ref?: React.RefObject<HTMLLabelElement | null> } & LabelProps) => {
  return (
    <label
      className={cn(
        'text-sm font-semibold text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};
Label.displayName = 'Label';

export { Label };
