import { ThemeProvider } from '@workspace/ui/providers/theme.provider';
import type React from 'react';
import { Toaster } from 'sonner';

export function AppProvider({ children }: { readonly children: React.ReactNode }) {
	return (
		<ThemeProvider defaultTheme="system">
			{children}
			<Toaster richColors />
		</ThemeProvider>
	);
}
