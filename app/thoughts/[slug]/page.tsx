import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPostIds, getPostData } from '@/lib/substack';
import { ReadingProgress } from '@/components/ReadingProgress';
import { SubstackButton } from '@/components/SubstackLink';
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
      description: post.subtitle || `Read ${post.title} by Sahil Mahendrakar`,
      // Substack is the canonical source, so point search engines there.
      alternates: { canonical: post.substackUrl },
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
      <ReadingProgress />
      <article className="mx-auto max-w-[42rem] px-6 md:px-8 py-16 md:py-24">
        <div className="mb-12 md:mb-16">
          <Link
            href="/thoughts"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Thoughts
          </Link>
        </div>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <time dateTime={post.date}>
                {format(parseISO(post.date), 'MMMM d, yyyy')}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </div>
            <SubstackButton href={post.substackUrl} className="shrink-0 py-1.5 text-[0.8125rem]">
              Read on Substack
            </SubstackButton>
          </div>

          <h1 className="font-serif text-4xl md:text-[2.75rem] font-semibold tracking-tight leading-[1.12] text-balance mt-4">
            {post.title}
          </h1>

          {post.subtitle && (
            <p className="font-serif text-xl md:text-[1.4rem] leading-snug text-muted-foreground text-pretty mt-4">
              {post.subtitle}
            </p>
          )}
        </header>

        <div
          className="post-body"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <footer className="mt-16 md:mt-20">
          <Link
            href="/thoughts"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to all thoughts
          </Link>
        </footer>
      </article>
    </main>
  );
}
