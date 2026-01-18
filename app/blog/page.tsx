import { Metadata } from 'next';
import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { AnimatedLink } from '@/components/AnimatedLink';
import { format, parseISO } from 'date-fns';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Thoughts on building software, AI, and learning.',
};

export default function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 md:px-8 py-20 md:py-28">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back home
          </Link>
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Writings
        </h1>
        <p className="text-muted-foreground text-lg mb-12">
          Thoughts on building software, AI, and learning.
        </p>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group py-6 border-b border-border last:border-0"
              >
                <AnimatedLink href={`/blog/${post.id}`} className="block">
                  <div className="flex flex-col gap-2">
                    <time className="text-sm text-muted-foreground">
                      {format(parseISO(post.date), 'MMMM d, yyyy')}
                    </time>
                    <h2 className="text-xl md:text-2xl font-semibold group-hover:text-foreground transition-colors">
                      {post.title}
                    </h2>
                  </div>
                </AnimatedLink>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
