import type { Metadata } from 'next';
import { About } from '@/components/About';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Product-minded engineer building AI tools for learning and reading. SDE at AWS, former founder & CTO.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-6">
      <About />
    </div>
  );
}
