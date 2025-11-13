import type React from 'react';
import { Toaster } from 'sonner';
import { LayoutProvider } from './layout.provider';
import { ThemeProvider } from './theme.provider';

/**
 * Provides application-level theming and layout context and renders a global toaster.
 *
 * @param children - The UI content to be wrapped by the theme and layout providers.
 * @returns A JSX element that wraps `children` with a ThemeProvider (defaulting to the system theme), a LayoutProvider, and a global Toaster configured with rich colors.
 */
export function AppProvider({ children }: { readonly children: React.ReactNode }) {
	return (
		<ThemeProvider defaultTheme="system">
			<LayoutProvider>
				{children}
				<Toaster richColors />
			</LayoutProvider>
		</ThemeProvider>
	);
}