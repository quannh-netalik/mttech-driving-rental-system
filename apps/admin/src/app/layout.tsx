/* eslint-disable @next/next/no-page-custom-font */
import '@workspace/ui/globals.css';
import { Metadata } from 'next';

import { Providers } from '@/shared/components/Providers';
import ThemeBackground from '@/shared/components/theme/ThemeBackground';

export const metadata: Metadata = {
  title: 'Miền Trung Tech - Admin',
  description: 'Hệ thống quản trị cho dịch vụ thuê xe - Miền Trung Tech',
  icons: {
    icon: [
      {
        rel: 'icon',
        url: '/images/favicon-light.png',
        href: '/images/favicon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        rel: 'icon',
        url: '/images/favicon-dark.png',
        href: '/images/favicon-dark.png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" translate="no" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Momo+Trust+Display&family=Story+Script&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <div className="min-h-screen w-full relative">
          <ThemeBackground />

          {/* Content */}
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
