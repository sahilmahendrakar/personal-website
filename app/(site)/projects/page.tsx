import type { Metadata } from 'next';
import { Projects } from '@/components/Projects';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'AI-powered projects at the intersection of curiosity, learning, and discovery.',
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-6">
      <Projects />
    </div>
  );
}
