import { useThemeAnimation } from '@space-man/react-theme-animation';
import { ClientOnly } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { useTheme } from '@workspace/ui/providers/theme.provider';
import { Loader2, MoonStar, SunIcon } from 'lucide-react';

interface ThemeSwitcherProps {
  lightModeLabel?: string;
  darkModeLabel?: string;
}

/**
 * ThemeSwitcher toggles between light and dark modes only.
 * System mode is not included in the toggle cycle.
 */
export function ThemeSwitcher({
  lightModeLabel = 'Đổi nền sáng',
  darkModeLabel = 'Đổi nền tối',
}: Readonly<ThemeSwitcherProps>) {
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
      aria-label={theme === 'dark' ? lightModeLabel : darkModeLabel}
    >
      <ClientOnly fallback={<Loader2 className="animate-spin" />}>
        {theme === 'dark' ? <SunIcon /> : <MoonStar />}
      </ClientOnly>
    </Button>
  );
}
