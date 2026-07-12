import { XMLParser } from 'fast-xml-parser';

/**
 * Substack integration (Substack is the canonical source).
 *
 * At build time we fetch the publication's RSS feed, which Substack exposes
 * at `<publication-url>/feed` and which includes the full HTML of each post
 * inside `<content:encoded>`. Those posts are rendered on the personal site
 * as `/thoughts/<slug>` entries, with a link back to the Substack original.
 *
 * The publication URL is configured via the `SUBSTACK_URL` env var, e.g.
 *   SUBSTACK_URL=https://yourname.substack.com
 * When unset, it defaults to sahilmahendrakar.substack.com.
 */

const DEFAULT_SUBSTACK_URL = 'https://sahilmahendrakar.substack.com';

const SUBSTACK_URL = (process.env.SUBSTACK_URL || DEFAULT_SUBSTACK_URL).replace(/\/+$/, '');

/** How often (seconds) the feed is re-fetched via ISR. */
export const FEED_REVALIDATE_SECONDS = 3600;

export interface PostData {
  id: string;
  title: string;
  /** Substack's subtitle for the post (the feed's `<description>`). */
  subtitle?: string;
  date: string;
  contentHtml: string;
  /** Permalink to the post on Substack. */
  substackUrl: string;
  /** Estimated reading time in whole minutes. */
  readingMinutes: number;
}

export function isSubstackConfigured(): boolean {
  return SUBSTACK_URL.length > 0;
}

export function substackBaseUrl(): string {
  return SUBSTACK_URL;
}

// Module-level cache so a single build shares one fetch across the index page,
// generateStaticParams, and each post page.
let postsCache: Promise<PostData[]> | null = null;

export function getSortedPostsData(): Promise<PostData[]> {
  if (!SUBSTACK_URL) return Promise.resolve([]);
  if (!postsCache) {
    postsCache = fetchSubstackPosts().catch((err) => {
      // Allow a later build to retry, and don't take the whole site down.
      postsCache = null;
      console.error('[substack] Failed to fetch feed:', err);
      return [];
    });
  }
  return postsCache;
}

export async function getAllPostIds(): Promise<{ id: string }[]> {
  const posts = await getSortedPostsData();
  return posts.map((post) => ({ id: post.id }));
}

export async function getPostData(id: string): Promise<PostData> {
  const posts = await getSortedPostsData();
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error(`Post not found: ${id}`);
  return post;
}

async function fetchSubstackPosts(): Promise<PostData[]> {
  const feedUrl = `${SUBSTACK_URL}/feed`;
  const res = await fetch(feedUrl, {
    next: { revalidate: FEED_REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`Substack feed responded with ${res.status} ${res.statusText}`);
  }
  const xml = await res.text();

  const parser = new XMLParser({ ignoreAttributes: true });
  const parsed = parser.parse(xml) as ParsedFeed;

  const channel = parsed?.rss?.channel ?? parsed?.feed ?? {};
  let items = channel.item ?? [];
  if (!Array.isArray(items)) items = [items];

  return items
    .map(parseItem)
    .filter((post): post is PostData => Boolean(post.id && post.title))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

interface ParsedFeed {
  rss?: { channel?: { item?: ParsedItem[] | ParsedItem } };
  feed?: { item?: ParsedItem[] | ParsedItem };
}

type ParsedValue = string | { __cdata?: string; '#text'?: string } | undefined;
interface ParsedItem {
  title?: ParsedValue;
  link?: ParsedValue;
  pubDate?: ParsedValue;
  description?: ParsedValue;
  'content:encoded'?: ParsedValue;
}

function parseItem(item: ParsedItem): PostData {
  const link = textOf(item.link);
  const title = textOf(item.title);
  const pubDate = textOf(item.pubDate);
  const content = cleanContent(
    textOf(item['content:encoded']) || textOf(item.description) || ''
  );

  return {
    id: slugFromLink(link),
    title,
    subtitle: textOf(item.description) || undefined,
    date: parsePubDate(pubDate),
    contentHtml: content,
    substackUrl: link,
    readingMinutes: estimateReadingMinutes(content),
  };
}

/**
 * Substack's feed HTML can embed subscribe forms and CTA buttons that don't
 * belong on the mirrored page (there's a dedicated Substack link instead).
 */
function cleanContent(html: string): string {
  return html
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<p class="button-wrapper"[\s\S]*?<\/p>/gi, '')
    .replace(/<a[^>]*class="[^"]*button[^"]*"[\s\S]*?<\/a>/gi, '');
}

function estimateReadingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Normalize a value that fast-xml-parser may return as a string or {__cdata}. */
function textOf(node: ParsedValue): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'object') {
    if (typeof node.__cdata === 'string') return node.__cdata;
    if (typeof node['#text'] === 'string') return node['#text'];
  }
  return '';
}

/** `https://yourname.substack.com/p/my-post` → `my-post`. */
function slugFromLink(link: string): string {
  const match = link.match(/\/p\/([^/?#]+)/);
  return match ? match[1] : link;
}

/** RSS pubDate is RFC-822 (e.g. "Wed, 12 Jul 2026 10:00:00 GMT"); normalize to YYYY-MM-DD. */
function parsePubDate(pubDate: string): string {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return pubDate;
  return d.toISOString().slice(0, 10);
}
