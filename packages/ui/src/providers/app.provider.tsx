import type React from 'react';
import { Toaster } from 'sonner';
import { LayoutProvider } from './layout.provider';
import { ThemeProvider } from './theme.provider';

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
