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
    github?: string;
  };
  tech: string[];
  image?: string;
}

export const projects: Project[] = [
  {
    id: 'chickadee',
    name: 'Chickadee',
    tagline: 'A browser extension that reads any web page aloud, entirely on your machine',
    bullets: [
      'Runs the Kokoro-82M speech model in the browser on WebGPU via ONNX Runtime — no server, no account, nothing uploaded',
      'Highlights each sentence on the real page as it is read, using the CSS Custom Highlight API so the page is never modified',
      'Generates the next two sentences while the current one plays, so playback never waits on the GPU',
      'activeTab-only permissions: the reader is injected on demand and has no standing access to any site',
    ],
    exploring: 'A desktop version that reads any selected text, and word-level highlighting via forced alignment',
    links: {
      live: 'https://www.usechickadee.com',
      github: 'https://github.com/sahilmahendrakar/chickadee',
    },
    tech: ['Chrome Extension (MV3)', 'Kokoro-82M', 'ONNX Runtime Web', 'WebGPU', 'Next.js'],
    image: '/images/chickadee-thumbnail.png',
    id: 'jungle',
    name: 'Jungle',
    tagline: 'The collaborative workspace for your teammates and your agents',
    bullets: [
      'Slack-style channels and DMs where agents are participants — @mention one and it gets to work',
      'Persistent agents that do real work: open PRs, run services, and keep their memory across restarts',
      'Each agent runs the Claude Agent SDK in its own isolated container with a durable workspace',
      'Hook agents up to the tools your team already uses — GitHub, Gmail, Linear, Notion, Slack, Drive',
    ],
    exploring: 'Workflows and richer coordination between agents working as a team',
    links: {
      live: 'https://jungleagents.com',
      github: 'https://github.com/sahilmahendrakar/jungle',
    },
    tech: ['TypeScript', 'Node.js', 'React', 'Claude Agent SDK', 'Postgres', 'Docker'],
    image: '/images/jungle.png',
  },
  {
    id: 'fluxx',
    name: 'Fluxx',
    tagline: 'AI-native project management for software development',
    bullets: [
      'Shared kanban board for real-time visibility into every agent\'s work',
      'Isolated git worktrees per agent, with dependencies that auto-unblock as work completes',
      'Planning workspace where specs live once and agents read/write them directly',
      'Agent-agnostic: drive Claude Code, Codex, and Cursor from one interface',
    ],
    exploring: 'Cloud-hosted agents and richer multi-agent coordination beyond local worktrees',
    links: {
      live: 'https://fluxx.sh',
      github: 'https://github.com/sahilmahendrakar/fluxx',
    },
    tech: ['Electron', 'TypeScript', 'React', 'Anthropic API', 'Git'],
    image: '/images/fluxx.jpg',
  },
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
    id: 'ccbeam',
    name: 'ccbeam',
    tagline: 'Teleport a Claude Code session between your devices',
    bullets: [
      'Move a live session to any machine in your ~/.ssh/config — same session id, context intact, nothing summarized',
      'Uncommitted work travels with you and comes back, with same-commit and clean-tree checks so nothing is silently lost',
      'Or beam to a cloud sandbox on your own E2B key — no account, no daemon, no hosted service to sign up for',
      'Device and folder pickers built from each machine\'s own Claude Code history, with branch and dirty-file counts',
    ],
    exploring: 'More destination types beyond ssh and sandboxes, and smarter carrying of environment-specific state',
    links: {
      live: 'https://www.npmjs.com/package/ccbeam',
      github: 'https://github.com/sahilmahendrakar/ccbeam',
    },
    tech: ['Node.js', 'JavaScript', 'Claude Code', 'SSH', 'E2B', 'Git'],
    image: '/images/ccbeam.png',
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
      github: 'https://github.com/sahilmahendrakar/context-overflow',
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
      github: 'https://github.com/sahilmahendrakar/boomie',
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
      github: 'https://github.com/sahilmahendrakar/waves',
    },
    tech: ['Swift', 'Google Lyria Realtime', 'Gemini', 'WebSocket', 'macOS'],
    image: '/images/Waves-thumbnail.png',
  },
];
