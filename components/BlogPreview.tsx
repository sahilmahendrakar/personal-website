import Link from 'next/link';
import { SectionWrapper } from './SectionWrapper';
import { AnimatedLink } from './AnimatedLink';
import { PostCover } from './PostCover';
import { getSortedPostsData } from '@/lib/substack';
import { format, parseISO } from 'date-fns';

export async function BlogPreview() {
  const posts = (await getSortedPostsData()).slice(0, 3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="thoughts" className="py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
        Thoughts
      </h2>

      <div className="flex flex-col">
        {posts.map((post) => (
          <article key={post.id} className="group">
            <Link
              href={`/thoughts/${post.id}`}
              className="flex items-start gap-5 -mx-4 rounded-xl px-4 py-5 transition-colors hover:bg-muted/60"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                  <h3 className="font-serif text-xl font-medium group-hover:text-foreground transition-colors">
                    {post.title}
                  </h3>
                  <time className="text-sm text-muted-foreground flex-shrink-0">
                    {format(parseISO(post.date), 'MMM d, yyyy')}
                  </time>
                </div>
                {post.subtitle && (
                  <p className="font-serif text-muted-foreground leading-snug mt-1">
                    {post.subtitle}
                  </p>
                )}
              </div>
              {post.coverImage && (
                <PostCover
                  src={post.coverImage}
                  className="aspect-[4/3] w-20 sm:w-28"
                  sizes="(max-width: 640px) 80px, 112px"
                />
              )}
            </Link>
            <div className="border-b border-border group-last:hidden" />
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <AnimatedLink href="/thoughts" className="text-sm text-muted-foreground">
          See more →
        </AnimatedLink>
      </div>
    </SectionWrapper>
  );
}
