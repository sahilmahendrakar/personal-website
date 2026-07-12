import { Metadata } from 'next';
import Link from 'next/link';
import { getSortedPostsData, isSubstackConfigured, substackBaseUrl } from '@/lib/substack';
import { SubstackButton } from '@/components/SubstackLink';
import { format, parseISO } from 'date-fns';

export const metadata: Metadata = {
  title: 'Thoughts',
  description: 'Thoughts on building software, AI, and learning.',
};

// Refresh the post list (mirrored from Substack) hourly via ISR.
export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getSortedPostsData();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 md:px-8 py-20 md:py-28">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back home
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 mb-4">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight">
            Thoughts
          </h1>
          {isSubstackConfigured() && (
            <SubstackButton
              href={substackBaseUrl()}
              className="shrink-0 mt-2 py-1.5 text-[0.8125rem]"
            >
              View on Substack
            </SubstackButton>
          )}
        </div>
        <p className="text-muted-foreground text-lg mb-14">
          Thoughts on building software, AI, and learning.
        </p>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link
                  href={`/thoughts/${post.id}`}
                  className="block -mx-4 rounded-xl px-4 py-6 transition-colors hover:bg-muted/60"
                >
                  <h2 className="font-serif text-2xl md:text-[1.75rem] font-semibold tracking-tight leading-snug text-balance">
                    {post.title}
                  </h2>
                  {post.subtitle && (
                    <p className="font-serif text-lg text-muted-foreground leading-snug text-pretty mt-2">
                      {post.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground mt-4">
                    <time dateTime={post.date}>
                      {format(parseISO(post.date), 'MMMM d, yyyy')}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingMinutes} min read</span>
                  </div>
                </Link>
                <div className="border-b border-border group-last:hidden" />
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
