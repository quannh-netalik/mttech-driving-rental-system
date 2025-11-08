import React from 'react';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@workspace/ui/providers/theme.provider';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
      <Toaster richColors />
    </ThemeProvider>
  );
}
