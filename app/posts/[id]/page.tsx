import Layout from '@/components/layout';
import { getAllPostIds, getPostData } from '@/lib/posts';
import Date from '@/components/date';
import utilStyles from '@/styles/utils.module.css';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const postIds = getAllPostIds();
  return postIds.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const postData = await getPostData(id);

  return {
    title: postData.title,
  };
}

export default async function Post({ params }: PostPageProps) {
  const { id } = await params;
  let postData;

  try {
    postData = await getPostData(id);
  } catch (error) {
    notFound();
  }

  return (
    <Layout>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml || '' }} />
      </article>
    </Layout>
  );
}

