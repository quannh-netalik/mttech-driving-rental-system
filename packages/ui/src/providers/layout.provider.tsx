import { getCookie, setCookie } from '@workspace/ui/lib';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
export type Collapsible = 'offcanvas' | 'icon' | 'none';

// Cookie constants following the pattern from sidebar.tsx
const LAYOUT_COLLAPSIBLE_COOKIE_NAME = 'layout_collapsible';
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Default values
const DEFAULT_COLLAPSIBLE = 'icon';

type LayoutContextType = {
	resetLayout: () => void;

	defaultCollapsible: Collapsible;
	collapsible: Collapsible;
	setCollapsible: (collapsible: Collapsible) => void;
};

const LayoutContext = createContext<LayoutContextType | null>(null);

type LayoutProviderProps = {
	children: React.ReactNode;
};

/**
 * Provides layout-related context to its children and persists the user's collapsible preference.
 *
 * The context includes the current `collapsible` mode, a setter (`setCollapsible`), the `defaultCollapsible` value,
 * and a `resetLayout` helper. The selected collapsible mode is read from and written to a cookie so the preference
 * is preserved across sessions.
 *
 * @param children - React nodes that will receive the layout context
 * @returns A React context provider element that supplies layout state and controls to its descendants
 */
export function LayoutProvider({ children }: LayoutProviderProps) {
	const [collapsible, _setCollapsible] = useState<Collapsible>(() => {
		const saved = getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME);
		return (saved as unknown as Collapsible) || DEFAULT_COLLAPSIBLE;
	});

	const setCollapsible = useCallback((newCollapsible: Collapsible) => {
		_setCollapsible(newCollapsible);
		setCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME, newCollapsible, LAYOUT_COOKIE_MAX_AGE);
	}, []);

	const resetLayout = useCallback(() => {
		setCollapsible(DEFAULT_COLLAPSIBLE);
	}, [setCollapsible]);

	const contextValue: LayoutContextType = useMemo(
		() => ({
			resetLayout,
			defaultCollapsible: DEFAULT_COLLAPSIBLE,
			collapsible,
			setCollapsible,
		}),
		[resetLayout, collapsible, setCollapsible],
	);

	return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>;
}

// Define the hook for the provider
/**
 * Accesses the layout context for components within a LayoutProvider.
 *
 * @returns The layout context containing `resetLayout`, `defaultCollapsible`, `collapsible`, and `setCollapsible`.
 * @throws Error if the hook is called outside of a `LayoutProvider`.
 */
export function useLayout() {
	const context = useContext(LayoutContext);
	if (!context) {
		throw new Error('useLayout must be used within a LayoutProvider');
	}
	return context;
}