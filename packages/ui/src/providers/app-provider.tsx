import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import React from 'react';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem enableColorScheme>
      {children}

      <Toaster />
    </ThemeProvider>
  );
}
