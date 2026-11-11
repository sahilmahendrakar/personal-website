import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Newsreader } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
});

export const metadata: Metadata = {
  title: {
    default: 'Sahil Mahendrakar',
    template: '%s | Sahil Mahendrakar',
  },
  description: 'Building in stealth. Previously agentic AI at AWS.',
  icons: {
    icon: '/images/profile.png',
  },
  keywords: ['software engineer', 'AI', 'machine learning', 'React', 'TypeScript', 'Next.js'],
  authors: [{ name: 'Sahil Mahendrakar' }],
  creator: 'Sahil Mahendrakar',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sahilmahendrakar.com',
    title: 'Sahil Mahendrakar',
    description: 'Building in stealth. Previously agentic AI at AWS.',
    siteName: 'Sahil Mahendrakar',
    images: [
      {
        url: 'https://sahilmahendrakar.com/images/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Sahil Mahendrakar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sahil Mahendrakar',
    description: 'Building in stealth. Previously agentic AI at AWS.',
    images: ['https://sahilmahendrakar.com/images/thumbnail.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
