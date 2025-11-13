import { Button } from '@workspace/ui/components/button';
import { useTheme } from '@workspace/ui/providers/theme.provider';
import { MoonStar, SunIcon } from 'lucide-react';

interface ThemeSwitcherProps {
	lightModeLabel?: string;
	darkModeLabel?: string;
}

/**
 * Render a button that toggles the application's theme between light and dark.
 *
 * @param lightModeLabel - Accessible label used when activating light mode (shown when current theme is dark)
 * @param darkModeLabel - Accessible label used when activating dark mode (shown when current theme is light)
 * @returns The button element that toggles the theme between `"light"` and `"dark"`
 */
export function ThemeSwitcher({
	lightModeLabel = 'Đổi nền sáng',
	darkModeLabel = 'Đổi nền tối',
}: Readonly<ThemeSwitcherProps>) {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			aria-label={theme === 'dark' ? lightModeLabel : darkModeLabel}
			onClick={() => {
				setTheme(theme === 'dark' ? 'light' : 'dark');
			}}
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