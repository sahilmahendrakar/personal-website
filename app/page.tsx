import Layout from '@/components/layout';
import utilStyles from '@/styles/utils.module.css';
import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import Date from '@/components/date';

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <Layout home>
      <section className={utilStyles.headingMd}>
        <p>Hello, I'm Sahil. I'm a junior at Columbia University studying Computer Science.</p>
        <p>
          See what I'm up to on <a href="https://github.com/sahilmahendrakar">GitHub</a>, and learn more about me
          on <a href="https://www.linkedin.com/in/sahil-mahendrakar/">LinkedIn</a>.
          Look below to find some of my thoughts.
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

