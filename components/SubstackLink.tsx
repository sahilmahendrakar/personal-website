import { cn } from '@/lib/utils';

export function SubstackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  );
}

interface SubstackButtonProps {
  href: string;
  children: React.ReactNode;
  /** Filled (primary) or outlined pill. */
  variant?: 'outline' | 'solid';
  className?: string;
}

export function SubstackButton({
  href,
  children,
  variant = 'outline',
  className,
}: SubstackButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
        variant === 'outline'
          ? 'border border-border bg-card text-foreground hover:border-[#FF6719]/60 hover:text-foreground'
          : 'bg-primary text-primary-foreground hover:opacity-90',
        className
      )}
    >
      <SubstackIcon
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          variant === 'outline' && 'text-[#FF6719]'
        )}
      />
      {children}
    </a>
  );
}
