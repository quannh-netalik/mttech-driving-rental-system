'use client';

import { Button } from '@workspace/ui/components/button';
import { useMounted } from '@workspace/ui/hooks/use-mounted';
import { Loader2, MoonStar, SunIcon } from 'lucide-react';
import { useThemeAnimation } from '@space-man/react-theme-animation';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export function ThemeSwitcher() {
  const { theme, toggleTheme, ref } = useThemeAnimation();
  const mounted = useMounted();

  return (
    <Button
      ref={ref}
      variant="outline"
      type="button"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === Theme.DARK ? 'Đổi nền sáng' : 'Đổi nền tối'}
    >
      {!mounted && <Loader2 className="animate-spin" />}
      {mounted && (theme === Theme.DARK ? <SunIcon /> : <MoonStar />)}
    </Button>
  );
}
