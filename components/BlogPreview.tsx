import { SectionWrapper } from './SectionWrapper';
import { AnimatedLink } from './AnimatedLink';
import { getSortedPostsData } from '@/lib/posts';
import { format, parseISO } from 'date-fns';

export function BlogPreview() {
  const posts = getSortedPostsData().slice(0, 3);

  if (posts.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="blog" className="py-20 md:py-28">
      <div className="flex items-baseline justify-between mb-10">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Writings
        </h2>
        <AnimatedLink href="/blog" className="text-sm text-muted-foreground">
          View all →
        </AnimatedLink>
      </div>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group py-4 border-b border-border last:border-0"
          >
            <AnimatedLink href={`/blog/${post.id}`} className="block">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                <h3 className="text-lg font-medium group-hover:text-foreground transition-colors">
                  {post.title}
                </h3>
                <time className="text-sm text-muted-foreground flex-shrink-0">
                  {format(parseISO(post.date), 'MMM d, yyyy')}
                </time>
              </div>
            </AnimatedLink>
          </article>
        ))}
      </div>
    </SectionWrapper>
  );
}
