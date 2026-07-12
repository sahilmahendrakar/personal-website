import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostIds, getPostData } from '@/lib/posts';
import { format, parseISO } from 'date-fns';

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

// Keep the mirrored Substack content fresh via ISR.
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getAllPostIds();
  return posts.map((post) => ({
    slug: post.id,
  }));
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostData(slug);
    return {
      title: post.title,
      description: `Read ${post.title} by Sahil Mahendrakar`,
      // Substack is the canonical source, so point search engines there.
      alternates: post.substackUrl ? { canonical: post.substackUrl } : undefined,
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  
  let post;
  try {
    post = await getPostData(slug);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <article className="mx-auto max-w-3xl px-6 md:px-8 py-20 md:py-28">
        <div className="mb-12">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to blog
          </Link>
        </div>

        <header className="mb-12">
          <time className="text-sm text-muted-foreground">
            {format(parseISO(post.date), 'MMMM d, yyyy')}
          </time>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mt-4">
            {post.title}
          </h1>
        </header>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-a:text-foreground prose-a:underline prose-a:underline-offset-4
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-li:text-muted-foreground
            prose-strong:text-foreground prose-strong:font-semibold
            prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm
            prose-pre:bg-muted prose-pre:border prose-pre:border-border"
          dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
        />

        <footer className="mt-16 pt-8 border-t border-border">
          {post.substackUrl && (
            <p className="text-sm text-muted-foreground mb-4">
              Originally published on{' '}
              <a
                href={post.substackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
              >
                Substack
              </a>
              .
            </p>
          )}
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to all posts
          </Link>
        </footer>
      </article>
    </main>
  );
}
