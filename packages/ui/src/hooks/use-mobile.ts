import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Detects mobile viewport (< 768px)
 * @returns false during SSR, actual state after hydration
 * @warning May cause hydration mismatches if used for conditional rendering
 */
export function useIsMobile() {
	const [isMobile, setIsMobile] = useState<boolean | undefined>(() => {
		if (typeof globalThis.window === 'undefined') return undefined;
		return globalThis.innerWidth < MOBILE_BREAKPOINT;
	});

	useEffect(() => {
		const mql = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(globalThis.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener('change', onChange);
		setIsMobile(globalThis.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener('change', onChange);
	}, []);

	return !!isMobile;
}
