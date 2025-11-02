'use client';

import '@workspace/ui/hooks/use-nprogress';
import 'nprogress/nprogress.css';
import { I18nProvider as ReactAriaI18nProvider } from 'react-aria-components';
import { Toaster } from '@workspace/ui/components/sonner';

interface MTTechProviderProps {
  children: React.ReactNode;
  locale?: string;
}

/**
 * The MTTechProvider component supplies locale and theme context to the application and toaster.
 */
export function MTTechProvider({ children, locale = 'en-GB' }: MTTechProviderProps) {
  return (
    <ReactAriaI18nProvider locale={locale}>
      {children}
      <Toaster />
    </ReactAriaI18nProvider>
  );
}
