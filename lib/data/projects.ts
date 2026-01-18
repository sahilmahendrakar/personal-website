export interface Project {
  id: string;
  name: string;
  tagline: string;
  bullets: string[];
  exploring: string;
  links: {
    live?: string;
    demo?: string;
    writeup?: string;
  };
  tech: string[];
}

export const projects: Project[] = [
  {
    id: 'aristotle',
    name: 'Aristotle',
    tagline: 'AI-powered e-reader for deeper understanding',
    bullets: [
      'Spoiler-free contextual Q&A that respects your reading position',
      'Inline insights and guided exploration for complex passages',
      'RAG pipeline with embeddings and metadata-aware retrieval',
    ],
    exploring: 'Adaptive learning paths based on comprehension signals',
    links: {
      live: 'https://www.aristotlereader.com',
    },
    tech: ['Next.js', 'TypeScript', 'Pinecone', 'Vercel AI SDK', 'Firebase'],
  },
  {
    id: 'lyrn-code',
    name: 'Lyrn Code',
    tagline: 'AI-powered personalized coding tutor',
    bullets: [
      'Skills matrix with adaptive practice and real-time evaluation',
      'Agent-driven tutoring with function calling and session memory',
      'Multi-panel workspace for immersive learning experience',
    ],
    exploring: 'Skill transfer detection and prerequisite mapping',
    links: {
      live: 'https://www.lyrncode.com',
    },
    tech: ['Next.js', 'TypeScript', 'LangChain', 'OpenAI', 'Firebase'],
  },
];
