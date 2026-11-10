export interface Publication {
  id: string;
  kind: 'paper' | 'patent';
  number: string;
  title: string;
  description: string;
  year: string;
  url?: string;
}

export const publications: Publication[] = [
  {
    id: 'paradee',
    kind: 'paper',
    number: 'arXiv:2610.06817',
    title: 'Paradee: Distilling Kokoro-82M into an 8M-Parameter Single-Voice Text-to-Speech Model',
    description: 'Distills the open Kokoro-82M text-to-speech model into an 8M-parameter student that keeps most of its quality at a tenth of the size.',
    year: '2026',
    url: 'https://arxiv.org/abs/2610.06817',
  },
  {
    id: 'zkp-selection',
    kind: 'patent',
    number: 'U.S. Patent 12,250,316 B2',
    title: 'Zero-knowledge proof system selection',
    description: 'Method for selecting optimal zero-knowledge proof systems based on application requirements and constraints.',
    year: '2024',
    url: 'https://patents.google.com/patent/US12250316B2',
  },
  {
    id: 'filesystem-encryption',
    kind: 'patent',
    number: 'U.S. Patent 11,295,029 B1',
    title: 'Filesystem interception and encryption enforcement',
    description: 'System for intercepting filesystem operations and enforcing encryption policies at the kernel level.',
    year: '2022',
    url: 'https://patents.google.com/patent/US11295029B1',
  },
];
