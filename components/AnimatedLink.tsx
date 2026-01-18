'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export function AnimatedLink({ href, children, className, external }: AnimatedLinkProps) {
  const linkProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Link
      href={href}
      className={cn('animated-link', className)}
      {...linkProps}
    >
      {children}
    </Link>
  );
}
