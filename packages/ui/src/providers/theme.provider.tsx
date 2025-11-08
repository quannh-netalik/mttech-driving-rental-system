import { ScriptOnce } from '@tanstack/react-router';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';
const MEDIA = '(prefers-color-scheme: dark)';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// references:
// https://ui.shadcn.com/docs/dark-mode/vite
// https://github.com/pacocoursey/next-themes/blob/main/next-themes/src/index.tsx
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  ...props
}: Readonly<ThemeProviderProps>) {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof globalThis.window !== 'undefined' ? (localStorage.getItem(storageKey) as Theme) : defaultTheme,
  );

  const handleMediaQuery = useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      if (theme !== 'system') return;
      const root = globalThis.document.documentElement;
      const targetTheme = e.matches ? 'dark' : 'light';
      if (!root.classList.contains(targetTheme)) {
        root.classList.remove('light', 'dark');
        root.classList.add(targetTheme);
      }
    },
    [theme],
  );

  // Listen for system preference changes
  useEffect(() => {
    const media = globalThis.matchMedia(MEDIA);

    media.addEventListener('change', handleMediaQuery);
    handleMediaQuery(media);

    return () => media.removeEventListener('change', handleMediaQuery);
  }, [handleMediaQuery]);

  useEffect(() => {
    const root = globalThis.document.documentElement;

    let targetTheme: string;

    if (theme === 'system') {
      localStorage.removeItem(storageKey);
      targetTheme = globalThis.matchMedia(MEDIA).matches ? 'dark' : 'light';
    } else {
      localStorage.setItem(storageKey, theme);
      targetTheme = theme;
    }

    // Only update if the target theme is not already applied
    if (!root.classList.contains(targetTheme)) {
      root.classList.remove('light', 'dark');
      root.classList.add(targetTheme);
    }
  }, [theme, storageKey]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme],
  );

  return (
    <ThemeProviderContext {...props} value={value}>
      <ScriptOnce>
        {/* Apply theme early to avoid FOUC */}
        {/* https://en.wikipedia.org/wiki/Flash_of_unstyled_content */}
        {`
          try {
            const theme = localStorage.getItem('theme');
            const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', isDark);
          } catch {}
        `}
      </ScriptOnce>
      {children}
    </ThemeProviderContext>
  );
}

export const useTheme = () => {
  const context = use(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
