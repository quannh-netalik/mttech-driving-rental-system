import { Button } from '@workspace/ui/components/button';
import { useTheme } from '@workspace/ui/providers/theme.provider';
import { MoonStar, SunIcon } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="outline"
      type="button"
      size="icon"
      suppressHydrationWarning
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Đổi nền sáng' : 'Đổi nền tối'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonStar />}
    </Button>
  );
}
