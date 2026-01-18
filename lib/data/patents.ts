export interface Patent {
  id: string;
  number: string;
  title: string;
  description: string;
  year: string;
  url?: string;
}

export const patents: Patent[] = [
  {
    id: 'zkp-selection',
    number: 'U.S. Patent 12,250,316 B2',
    title: 'Zero-knowledge proof system selection',
    description: 'Method for selecting optimal zero-knowledge proof systems based on application requirements and constraints.',
    year: '2024',
    url: 'https://patents.google.com/patent/US12250316B2',
  },
  {
    id: 'filesystem-encryption',
    number: 'U.S. Patent 11,295,029 B1',
    title: 'Filesystem interception and encryption enforcement',
    description: 'System for intercepting filesystem operations and enforcing encryption policies at the kernel level.',
    year: '2022',
    url: 'https://patents.google.com/patent/US11295029B1',
  },
];
