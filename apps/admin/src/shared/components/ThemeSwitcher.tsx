'use client';

import { Button } from '@workspace/ui/components/button';
import { useMounted } from '@workspace/ui/hooks/use-mounted';
import { MoonStar, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}>
      {mounted && (theme === Theme.DARK ? <SunIcon /> : <MoonStar />)}
      {!mounted && <div className="size-3.5" />}
    </Button>
  );
}
