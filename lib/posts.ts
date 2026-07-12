import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getSubstackPosts } from './substack';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface PostData {
  id: string;
  title: string;
  date: string;
  contentHtml?: string;
  /** Present when this post originates from Substack. */
  substackUrl?: string;
}

// --- Local markdown posts (fallback / for posts not mirrored on Substack) ---

function getLocalPostIds(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

async function getLocalPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark().use(html).process(matterResult.content);

  return {
    id,
    contentHtml: processedContent.toString(),
    ...(matterResult.data as { title: string; date: string }),
  };
}

// --- Merged API: Substack posts first, then any local-only markdown ---

export async function getSortedPostsData(): Promise<PostData[]> {
  const substackPosts = await getSubstackPosts();
  const substackIds = new Set(substackPosts.map((p) => p.id));

  // Don't double-list a post that's both on Substack and local.
  const localOnlyIds = getLocalPostIds().filter((id) => !substackIds.has(id));
  const localPosts = await Promise.all(localOnlyIds.map(getLocalPostData));

  const all = [...substackPosts, ...localPosts];
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getAllPostIds(): Promise<{ id: string }[]> {
  const posts = await getSortedPostsData();
  return posts.map((post) => ({ id: post.id }));
}

export async function getPostData(id: string): Promise<PostData> {
  const substackPosts = await getSubstackPosts();
  const substackPost = substackPosts.find((p) => p.id === id);
  if (substackPost) return substackPost;
  return getLocalPostData(id);
}
