import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PostCoverProps {
  src: string;
  /**
   * Covers sit next to the post title everywhere they're used, so they're
   * decorative by default — an empty alt keeps screen readers from repeating
   * the headline.
   */
  alt?: string;
  /** Sizing/aspect classes for the frame, e.g. `aspect-[16/9] w-full`. */
  className?: string;
  sizes: string;
  priority?: boolean;
}

/**
 * A post's Substack cover image (its social preview), framed consistently
 * across the thoughts index, the home page preview, and the post itself.
 */
export function PostCover({ src, alt = '', className, sizes, priority }: PostCoverProps) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border',
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      />
    </div>
  );
}
