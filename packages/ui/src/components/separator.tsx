'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';

import { cn } from '@workspace/ui/lib/utils';

/**
 * A visual separator component that divides content either horizontally or vertically.
 * Built on Radix UI Separator primitive with dark mode support.
 *
 * @example
 * ```tsx
 * <Separator orientation="horizontal" />
 * <Separator orientation="vertical" className="h-20" />
 * ```
 */
function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-black/20 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px dark:bg-white/20',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
