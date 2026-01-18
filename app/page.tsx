import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Projects } from '@/components/Projects';
import { Timeline } from '@/components/Timeline';
import { Patents } from '@/components/Patents';
import { Now } from '@/components/Now';
import { BlogPreview } from '@/components/BlogPreview';
import { Contact } from '@/components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <Hero />
        <About />
        <Projects />
        <Timeline />
        <Patents />
        <Now />
        <BlogPreview />
        <Contact />
      </div>
    </main>
  );
}
