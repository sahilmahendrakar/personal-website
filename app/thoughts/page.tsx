import { Metadata } from 'next';
import Link from 'next/link';
import {
  getSortedPostsData,
  isSubstackConfigured,
  substackBaseUrl,
  type PostData,
} from '@/lib/substack';
import { SubstackButton } from '@/components/SubstackLink';
import { PostCover } from '@/components/PostCover';
import { format, parseISO } from 'date-fns';

export const metadata: Metadata = {
  title: 'Thoughts',
  description: 'Thoughts on building software, AI, and learning.',
};

// Refresh the post list (mirrored from Substack) via ISR.
export const revalidate = 600;

export default async function BlogPage() {
  const posts = await getSortedPostsData();
  const [featured, ...rest] = posts;

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
          <>
            <FeaturedPost post={featured} />

            {rest.length > 0 && (
              <div className="mt-16 flex flex-col">
                {rest.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function FeaturedPost({ post }: { post: PostData }) {
  return (
    <article className="group">
      <Link href={`/thoughts/${post.id}`} className="block">
        {post.coverImage && (
          <PostCover
            src={post.coverImage}
            className="aspect-[16/9] w-full mb-7"
            sizes="(max-width: 768px) 100vw, 48rem"
            priority
          />
        )}
        <PostMeta post={post} />
        <h2 className="font-serif text-3xl md:text-[2.125rem] font-semibold tracking-tight leading-[1.15] text-balance mt-3">
          {post.title}
        </h2>
        {post.subtitle && (
          <p className="font-serif text-lg md:text-xl text-muted-foreground leading-snug text-pretty mt-3">
            {post.subtitle}
          </p>
        )}
      </Link>
    </article>
  );
}

function PostRow({ post }: { post: PostData }) {
  return (
    <article className="group">
      <Link
        href={`/thoughts/${post.id}`}
        className="flex items-start gap-5 sm:gap-8 -mx-4 rounded-xl px-4 py-6 transition-colors hover:bg-muted/60"
      >
        <div className="min-w-0 flex-1">
          <PostMeta post={post} />
          <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight leading-snug text-balance mt-2">
            {post.title}
          </h2>
          {post.subtitle && (
            <p className="font-serif text-base sm:text-lg text-muted-foreground leading-snug text-pretty mt-1.5 line-clamp-2">
              {post.subtitle}
            </p>
          )}
        </div>
        {post.coverImage && (
          <PostCover
            src={post.coverImage}
            className="aspect-[4/3] w-24 sm:w-36 mt-1"
            sizes="(max-width: 640px) 96px, 144px"
          />
        )}
      </Link>
      <div className="border-b border-border group-last:hidden" />
    </article>
  );
}

function PostMeta({ post }: { post: PostData }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <time dateTime={post.date}>{format(parseISO(post.date), 'MMMM d, yyyy')}</time>
      <span aria-hidden="true">·</span>
      <span>{post.readingMinutes} min read</span>
    </div>
  );
}
