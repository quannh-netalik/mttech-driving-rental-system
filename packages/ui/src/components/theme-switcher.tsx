import { useThemeAnimation } from '@space-man/react-theme-animation';
import { ClientOnly } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { useTheme } from '@workspace/ui/providers/theme.provider';
import { Loader2, MoonStar, SunIcon } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { toggleTheme, ref } = useThemeAnimation();

  return (
    <Button
      ref={ref}
      variant="outline"
      type="button"
      size="icon"
      suppressHydrationWarning
      onClick={() => (setTheme(theme === 'dark' ? 'light' : 'dark'), toggleTheme())}
      aria-label={theme === 'dark' ? 'Đổi nền sáng' : 'Đổi nền tối'}
    >
      <ClientOnly fallback={<Loader2 className="animate-spin" />}>
        {theme === 'dark' ? <SunIcon /> : <MoonStar />}
      </ClientOnly>
    </Button>
  );
}
