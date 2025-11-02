'use client';

import { useEffect, useState } from 'react';

const DEFAULT_MOBILE_BREAKPOINT = 768;

interface UseIsMobileProps {
  /**
   * The breakpoint width in pixels to determine mobile viewport.
   * @default 768
   */
  breakpoint?: number;
}

/**
+ * React hook that detects whether the current viewport is mobile-sized.
+ * 
+ * @remarks
+ * - Returns `false` during SSR (server-side rendering)
+ * - Updates reactively when viewport size crosses the breakpoint
+ * - Creates a `matchMedia` listener that cleans up on unmount
+ * 
+ * @param props - Configuration options
+ * @returns `true` if viewport width is less than breakpoint, `false` otherwise
+ * 
+ * @example
+ * ```tsx
+ * function MyComponent() {
+ *   const isMobile = useIsMobile(); // Uses default 768px breakpoint
+ *   const isTablet = useIsMobile({ breakpoint: 1024 });
+ *   return <div>{isMobile ? 'Mobile' : 'Desktop'}</div>;
+ * }
+ * ```
+ */
export function useIsMobile({ breakpoint = DEFAULT_MOBILE_BREAKPOINT }: UseIsMobileProps = {}) {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(() => {
    // Return undefined during SSR, actual value on client
    if (typeof window === 'undefined') return undefined;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    mql.addEventListener('change', onChange);

    // Set initial value and update when breakpoint changes
    setIsMobile(window.innerWidth < breakpoint);

    return () => mql.removeEventListener('change', onChange);
  }, [breakpoint]);

  return !!isMobile;
}
