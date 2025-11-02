'use client';

import { Button } from '@workspace/ui/components/Button';
import { toast } from '@workspace/ui/components/Sonner';
import { Theme, ThemeSwitcher } from '@/shared/components/ThemeSwitcher';

import LogoMTTech from '@workspace/ui/components/LogoMTTech';

import { useTheme } from 'next-themes';

const colors = {
  [Theme.DARK]: {
    primary: '#FFFFFF',
    secondary: '#E32324',
  },
  [Theme.LIGHT]: {
    primary: '#1C1C1C',
    secondary: '#E32324',
  },
} as const;

export default function Page() {
  const { theme } = useTheme();
  const { primary, secondary } = colors[(theme as Theme) || Theme.LIGHT]!;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-2xl mx-auto px-4">
        <ThemeSwitcher />
        <h1 className="text-4xl md:text-5xl font-bold my-6">Welcome to Next.js</h1>
        <p className="text-lg text-muted-foreground">
          A modern, full-stack development platform with everything you need to create beautiful, performant
          applications with TypeScript, React, and more.
        </p>
        <Button
          size="lg"
          className="mt-6"
          onClick={() =>
            toast.success({
              title: 'Welcome to Next.js',
              description:
                'You have successfully launched the starter project. Explore and start building your next great idea!',
            })
          }
        >
          Welcome
        </Button>

        <LogoMTTech primary={primary} secondary={secondary} />
      </div>
    </div>
  );
}
