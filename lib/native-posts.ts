import { getSortedPostsData, type PostData } from './substack';

/**
 * Posts written for this site, each with its own route under `/writings`.
 * They are listed alongside the posts mirrored from Substack.
 */
export const PARADEE_POST: PostData = {
  id: 'paradee',
  title: 'Paradee: Distilling a voice model to one-tenth its size',
  subtitle: 'What I learned shrinking Kokoro-82M into an 8M-parameter voice model that runs on a CPU.',
  date: '2026-10-05',
  contentHtml: '',
  // TODO: set once the Substack version is published.
  substackUrl: '',
  readingMinutes: 8,
  coverImage: '/writings/paradee/img/cover.png',
};

const NATIVE_POSTS: PostData[] = [PARADEE_POST];

/** Native and Substack posts together, newest first. */
export async function getAllPosts(): Promise<PostData[]> {
  const titles = new Set(NATIVE_POSTS.map((post) => post.title));
  // A native post replaces its Substack mirror, so it isn't listed twice.
  const mirrored = (await getSortedPostsData()).filter((post) => !titles.has(post.title));
  return [...NATIVE_POSTS, ...mirrored].sort((a, b) => (a.date < b.date ? 1 : -1));
}
