import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Projects } from '@/components/Projects';
import { Timeline } from '@/components/Timeline';
import { Patents } from '@/components/Patents';
import { Now } from '@/components/Now';
// import { BlogPreview } from '@/components/BlogPreview';
import { Contact } from '@/components/Contact';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen lg:pl-48">
        <div className="mx-auto max-w-5xl px-6 md:px-6">
          <Hero />
        </div>
        <div className="mx-auto max-w-3xl px-6 md:px-6">
          <About />
          <Projects />
          <Timeline />
          <Patents />
          <Now />
          {/* <BlogPreview /> */}
          <Contact />
        </div>
      </main>
    </>
  );
}
