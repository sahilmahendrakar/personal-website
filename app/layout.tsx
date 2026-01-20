import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Sahil Mahendrakar',
    template: '%s | Sahil Mahendrakar',
  },
  description: 'Software Engineer at AWS. Building AI-native tools for learning and reading. Ex-founder/CTO.',
  icons: {
    icon: '/images/profile.png',
  },
  keywords: ['software engineer', 'AWS', 'AI', 'machine learning', 'React', 'TypeScript', 'Next.js'],
  authors: [{ name: 'Sahil Mahendrakar' }],
  creator: 'Sahil Mahendrakar',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sahilmahendrakar.com',
    title: 'Sahil Mahendrakar',
    description: 'Software Engineer at AWS. Building AI-native tools for learning and reading.',
    siteName: 'Sahil Mahendrakar',
    images: [
      {
        url: 'https://sahilmahendrakar.com/images/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Sahil Mahendrakar - Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sahil Mahendrakar',
    description: 'Software Engineer at AWS. Building AI-native tools for learning and reading.',
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {/* Analytics placeholder - replace with your preferred provider */}
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
