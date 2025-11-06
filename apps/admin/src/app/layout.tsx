/* eslint-disable @next/next/no-page-custom-font */
import { Metadata } from 'next';
import '@workspace/ui/globals.css';
import { Providers } from '@/shared/components/Providers';

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
          {/* Light Mode Background */}
          <div
            className="absolute inset-0 -z-10 transition-opacity duration-500 dark:opacity-0"
            style={{
              background: 'radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)',
            }}
          />

          {/* Dark Mode Background */}
          <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 dark:opacity-100 bg-[#020617]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle 500px at 50% 200px, #3e3e3e, transparent)',
              }}
            />
          </div>

          {/* Content */}
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
