import type { Metadata } from 'next';
import { Now } from '@/components/Now';

export const metadata: Metadata = {
  title: 'Now',
  description: 'Current focus and interests.',
};

export default function NowPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-6">
      <Now />
    </div>
  );
}
