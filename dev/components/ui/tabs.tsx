'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'

import { cn } from '../../lib/utils'

const Tabs = TabsPrimitive.Root

const TabsList = ({
  className,
  ref,
  ...props
}: {
  ref?: React.RefObject<null | React.ElementRef<typeof TabsPrimitive.List>>
} & React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-11 items-center justify-center rounded-xl bg-gray-100 p-1 text-gray-500',
      className,
    )}
    ref={ref}
    {...props}
  />
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = ({
  className,
  ref,
  ...props
}: {
  ref?: React.RefObject<null | React.ElementRef<typeof TabsPrimitive.Trigger>>
} & React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
      className,
    )}
    ref={ref}
    {...props}
  />
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = ({
  className,
  ref,
  ...props
}: {
  ref?: React.RefObject<null | React.ElementRef<typeof TabsPrimitive.Content>>
} & React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn(
      'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
      className,
    )}
    ref={ref}
    {...props}
  />
)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsContent, TabsList, TabsTrigger }
