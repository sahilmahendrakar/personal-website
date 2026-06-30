'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Experience', href: '/experience' },
  { label: 'Patents', href: '/patents' },
  { label: 'Now', href: '/now' },
  // { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

function isNavActive(pathname: string, href: string) {
  if (href === '/projects') {
    return pathname === '/projects' || pathname.startsWith('/projects/');
  }
  return pathname === href;
}

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroInView, setHeroInView] = useState(true);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (pathname === '/') {
      setHeroInView(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }
    const main = document.querySelector('main');
    const heroSection = main?.querySelector('section');
    if (!heroSection) return;

    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    observer.observe(heroSection);
    return () => observer.disconnect();
  }, [pathname]);

  const showProfilePic = pathname !== '/' || !heroInView;

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-48 flex-col items-center py-10 px-4 z-50">
        <Link
          href="/"
          className={cn(
            'mb-10 transition-all duration-300',
            showProfilePic ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          )}
        >
          <Image src="/images/profile.png" alt="Sahil Mahendrakar" width={72} height={72} className="rounded-full" />
        </Link>

        <nav className="flex flex-col gap-6 w-full pl-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-base transition-colors animated-link',
                isNavActive(pathname, link.href)
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile/Tablet Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background shadow-md">
        <nav className="px-6">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className={cn(
                'flex-shrink-0 transition-all duration-300',
                showProfilePic ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              )}
            >
              <Image src="/images/profile.png" alt="Sahil Mahendrakar" width={40} height={40} className="rounded-full" />
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="8" x2="20" y2="8" />
                    <line x1="4" y1="16" x2="20" y2="16" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-in-out',
              isMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
            )}
          >
            <div className="flex flex-col gap-3 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'text-sm transition-colors py-2',
                    isNavActive(pathname, link.href)
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
