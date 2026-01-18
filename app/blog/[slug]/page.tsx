import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostIds, getPostData } from '@/lib/posts';
import { format, parseISO } from 'date-fns';

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPostIds();
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
