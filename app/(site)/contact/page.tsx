import type { Metadata } from 'next';
import { Contact } from '@/components/Contact';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch via email, LinkedIn, or GitHub.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 md:px-6">
      <Contact />
    </div>
  );
}
