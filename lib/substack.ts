import { XMLParser } from 'fast-xml-parser';
import type { PostData } from './posts';

/**
 * Substack integration (Option A: Substack is the canonical source).
 *
 * At build time we fetch the publication's RSS feed, which Substack exposes
 * at `<publication-url>/feed` and which includes the full HTML of each post
 * inside `<content:encoded>`. Those posts are rendered on the personal site
 * as `/blog/<slug>` entries, with a link back to the Substack original.
 *
 * The publication URL is configured via the `SUBSTACK_URL` env var, e.g.
 *   SUBSTACK_URL=https://yourname.substack.com
 * When unset, no Substack posts are returned (and the site falls back to any
 * local markdown in /posts), so the build never fails.
 */

const SUBSTACK_URL = (process.env.SUBSTACK_URL || '').replace(/\/+$/, '');

/** How often (seconds) the feed is re-fetched via ISR. */
export const FEED_REVALIDATE_SECONDS = 3600;

export interface SubstackPostData extends PostData {
  /** Permalink to the post on Substack. */
  substackUrl: string;
  /** Short excerpt from the feed's `<description>`, if present. */
  excerpt?: string;
}

export function isSubstackConfigured(): boolean {
  return SUBSTACK_URL.length > 0;
}

export function substackBaseUrl(): string {
  return SUBSTACK_URL;
}

// Module-level cache so a single build shares one fetch across the index page,
// generateStaticParams, and each post page.
let postsCache: Promise<SubstackPostData[]> | null = null;

export function getSubstackPosts(): Promise<SubstackPostData[]> {
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

async function fetchSubstackPosts(): Promise<SubstackPostData[]> {
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
    .filter((post): post is SubstackPostData => Boolean(post.id && post.title));
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

function parseItem(item: ParsedItem): SubstackPostData {
  const link = textOf(item.link);
  const title = textOf(item.title);
  const pubDate = textOf(item.pubDate);
  const content = textOf(item['content:encoded']) || textOf(item.description) || '';

  return {
    id: slugFromLink(link),
    title,
    date: parsePubDate(pubDate),
    contentHtml: content,
    substackUrl: link,
    excerpt: textOf(item.description) || undefined,
  };
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
