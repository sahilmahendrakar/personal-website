import { Header } from '@/components/Header';
import { SiteFooter } from '@/components/SiteFooter';

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="min-h-screen lg:pl-48 pt-16 lg:pt-0">
        {children}
        <SiteFooter />
      </main>
    </>
  );
}
