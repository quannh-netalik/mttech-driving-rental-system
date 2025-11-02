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
        url: './images/favicon-light.png',
        href: './images/favicon-light.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        rel: 'icon',
        url: './images/favicon-dark.png',
        href: './images/favicon-dark.png',
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
    <html lang="en" translate="no" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Momo+Trust+Display&family=Story+Script&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
