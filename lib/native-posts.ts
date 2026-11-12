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

export const PARADEE_11_POST: PostData = {
  id: 'paradee-1-1',
  title: 'Paradee-8M-v1.1',
  subtitle: 'A new decoder head makes Paradee three times faster and removes most of the buzz.',
  date: '2026-10-19',
  contentHtml: '',
  substackUrl: '',
  readingMinutes: 3,
  coverImage: '/writings/paradee-1-1/img/cover.jpg',
};

export const PARADEE_12_POST: PostData = {
  id: 'paradee-1-2',
  title: 'Paradee 1.2: Expanding to additional voices',
  subtitle: 'Paradee now speaks four voices without growing in size or losing quality.',
  date: '2026-10-28',
  contentHtml: '',
  substackUrl: '',
  readingMinutes: 3,
  coverImage: '/writings/paradee-1-2/img/cover.jpg',
};

export const EARLYBIRD_POST: PostData = {
  id: 'earlybird',
  title: 'Earlybird: predictive speech-to-text in 29M parameters',
  subtitle: 'A tiny streaming speech-to-text model that predicts words before the speaker finishes saying them with a confidence score.',
  date: '2026-11-10',
  contentHtml: '',
  substackUrl: '',
  readingMinutes: 7,
  coverImage: '/writings/earlybird/img/cover.png',
};

export const PARADEE_13_POST: PostData = {
  id: 'paradee-1-3',
  title: 'Paradee 1.3: The smallest multilingual TTS model',
  subtitle:
    'Paradee now speaks Hindi, French and Spanish along with English, without growing in size or losing quality on existing voices.',
  date: '2026-11-09',
  contentHtml: '',
  substackUrl: '',
  readingMinutes: 4,
  coverImage: '/writings/paradee-1-3/img/cover.jpg',
};

export const COLD_STARTS_POST: PostData = {
  id: 'cold-starts',
  title: 'Serving a fine-tuned model efficiently on Modal with 15-second cold starts',
  subtitle: 'How GPU memory snapshots cut a custom model’s cold start from minutes to seconds, and what that does to the cost of serving it at low traffic.',
  date: '2026-11-12',
  contentHtml: '',
  substackUrl: '',
  readingMinutes: 7,
};

const NATIVE_POSTS: PostData[] = [COLD_STARTS_POST, EARLYBIRD_POST, PARADEE_POST, PARADEE_11_POST, PARADEE_12_POST, PARADEE_13_POST];

/** Native and Substack posts together, newest first. */
export async function getAllPosts(): Promise<PostData[]> {
  const titles = new Set(NATIVE_POSTS.map((post) => post.title));
  // A native post replaces its Substack mirror, so it isn't listed twice.
  const mirrored = (await getSortedPostsData()).filter((post) => !titles.has(post.title));
  return [...NATIVE_POSTS, ...mirrored].sort((a, b) => (a.date < b.date ? 1 : -1));
}
