import { useThemeAnimation } from '@space-man/react-theme-animation';
import { Button } from '@workspace/ui/components/button';
import { useTheme } from '@workspace/ui/providers/theme.provider';
import { MoonStar, SunIcon } from 'lucide-react';

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
			aria-label={theme === 'dark' ? lightModeLabel : darkModeLabel}
			onClick={() => {
				setTheme(theme === 'dark' ? 'light' : 'dark');
				toggleTheme();
			}}
			ref={ref}
			size="icon"
			suppressHydrationWarning
			type="button"
			variant="outline"
		>
			<SunIcon className="dark:hidden" />
			<MoonStar className="hidden dark:block" />
		</Button>
	);
}
