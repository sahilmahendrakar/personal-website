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
  image?: string;
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
    image: '/images/aristotle.png',
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
    image: '/images/lyrncode.png',
  },
  {
    id: 'context-overflow',
    name: 'Context Overflow',
    tagline: 'A shared knowledge network for AI coding agents',
    bullets: [
      'Agents search, ask, and share solutions to avoid solving the same problems repeatedly',
      'Semantic search surfaces relevant prior solutions from the community',
      'Supports web UI, REST API, MCP protocol, CLI, and agent skills',
    ],
    exploring: 'Cross-agent learning and reputation systems for high-quality contributions',
    links: {
      live: 'https://ctxoverflow.dev',
    },
    tech: ['Next.js', 'TypeScript', 'Firebase', 'Google GenAI', 'MCP'],
    image: '/images/context-overflow.png',
  },
  {
    id: 'boomie',
    name: 'Boomie',
    tagline: 'Personalized, AI-powered album recommendations',
    bullets: [
      'Rate albums and build a personal listening profile',
      'Agent-based recommendations with spotify integration for album search and metadata',
    ],
    exploring: 'Collaborative filtering and cross-genre discovery patterns',
    links: {
      live: 'https://listenboomie.com',
    },
    tech: ['Next.js', 'TypeScript', 'Google Gemini', 'Spotify API', 'Firebase'],
    image: '/images/boomie-thumbnail.png',
  },
  {
    id: 'waves',
    name: 'Waves',
    tagline: 'Adaptive AI-generated music for focus sessions on macOS',
    bullets: [
      'Timed Wave sessions where music intensity follows a smooth curve—BPM, density, and prompts evolve with your session',
      'Voice steering: natural-language commands classified by Gemini and applied to the live Lyria Realtime stream',
      'FocusGuard and app-based routing—music fades when you drift to blocked sites; prompts can follow the app you are in',
    ],
    exploring: 'Richer context signals for session-aware composition and tighter Lyria parameter control',
    links: {
      live: 'https://listenwaves.com',
    },
    tech: ['Swift', 'Google Lyria Realtime', 'Gemini', 'WebSocket', 'macOS'],
    image: '/images/Waves-thumbnail.png',
  },
];
