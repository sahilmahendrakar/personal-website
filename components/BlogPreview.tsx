import { SectionWrapper } from './SectionWrapper';
import { AnimatedLink } from './AnimatedLink';
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

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group py-4 border-b border-border last:border-0"
          >
            <AnimatedLink href={`/thoughts/${post.id}`} className="block">
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
            </AnimatedLink>
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
