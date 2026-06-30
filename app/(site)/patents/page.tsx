import type { Metadata } from 'next';
import { Patents } from '@/components/Patents';

export const metadata: Metadata = {
  title: 'Patents',
  description: 'Patents and intellectual property.',
};

export default function PatentsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-6">
      <Patents />
    </div>
  );
}
