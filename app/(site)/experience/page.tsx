import type { Metadata } from 'next';
import { Timeline } from '@/components/Timeline';

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Work history, education, and engineering experience.',
};

export default function ExperiencePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-6">
      <Timeline />
    </div>
  );
}
