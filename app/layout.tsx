import type { Metadata } from 'next';
import { siteTitle } from '@/components/layout';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: 'About Sahil Mahendrakar',
  openGraph: {
    title: siteTitle,
    description: 'About Sahil Mahendrakar',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

