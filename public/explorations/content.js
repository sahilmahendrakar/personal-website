// Shared content for the design explorations. Mirrors lib/data/* and the
// homepage components so every prototype shows Sahil's real site content.
window.SITE = {
  name: 'Sahil Mahendrakar',
  tagline: 'Building things. Breaking stuff. Humaning around.',
  roles: ['Agentic AI @ AWS', 'Former founder & CTO', 'Building for the agent era'],
  avatar: 'img/profile.png',

  about: {
    points: [
      { title: 'Agentic AI at AWS', detail: 'building long-term memory for agents on Bedrock AgentCore' },
      { title: 'Former co-founder/CTO', detail: 'raised $1M, Stanford Blockchain Accelerator' },
      { title: 'Building agent-native tools', detail: 'for people building alongside AI agents' },
    ],
    paragraph:
      'I’m a product-minded engineer who builds across the stack, from system design to UI/UX. At AWS I work on long-term memory for AI agents; on my own time I build tools for people working alongside them. Lately, I’ve been focused on how humans and agents can build software together.',
  },

  projects: [
    {
      id: 'chickadee', name: 'Chickadee', image: 'img/chickadee.jpg',
      tagline: 'Reads any web page aloud, entirely on your machine',
      bullets: [
        'Runs the Kokoro-82M speech model in the browser on WebGPU via ONNX Runtime — no server, no account, nothing uploaded',
        'Highlights each sentence on the real page as it is read, using the CSS Custom Highlight API so the page is never modified',
      ],
      tech: ['Chrome Extension (MV3)', 'Kokoro-82M', 'ONNX Runtime Web', 'WebGPU', 'Next.js'],
      links: { live: 'https://www.usechickadee.com', github: 'https://github.com/sahilmahendrakar/chickadee' },
    },
    {
      id: 'jungle', name: 'Jungle', image: 'img/jungle.jpg',
      tagline: 'The collaborative workspace for your teammates and your agents',
      bullets: [
        'Slack-style channels and DMs where agents are participants — @mention one and it gets to work',
        'Persistent agents that do real work: open PRs, run services, and keep their memory across restarts',
      ],
      tech: ['TypeScript', 'Node.js', 'React', 'Claude Agent SDK', 'Postgres', 'Docker'],
      links: { live: 'https://jungleagents.com', github: 'https://github.com/sahilmahendrakar/jungle' },
    },
    {
      id: 'fluxx', name: 'Fluxx', image: 'img/fluxx.jpg',
      tagline: 'AI-native project management for software development',
      bullets: [
        'Shared kanban board for real-time visibility into every agent’s work',
        'Agent-agnostic: drive Claude Code, Codex, and Cursor from one interface',
      ],
      tech: ['Electron', 'TypeScript', 'React', 'Anthropic API', 'Git'],
      links: { live: 'https://fluxx.sh', github: 'https://github.com/sahilmahendrakar/fluxx' },
    },
    {
      id: 'aristotle', name: 'Aristotle', image: 'img/aristotle.jpg',
      tagline: 'AI-powered e-reader for deeper understanding',
      bullets: [
        'Spoiler-free contextual Q&A that respects your reading position',
        'Inline insights and guided exploration for complex passages',
      ],
      tech: ['Next.js', 'TypeScript', 'Pinecone', 'Vercel AI SDK', 'Firebase'],
      links: { live: 'https://www.aristotlereader.com' },
    },
    {
      id: 'ccbeam', name: 'ccbeam', image: 'img/ccbeam.jpg',
      tagline: 'Teleport a Claude Code session between your devices',
      bullets: [
        'Move a live session to any machine in your ~/.ssh/config — same session id, context intact, nothing summarized',
        'Or beam to a cloud sandbox on your own E2B key — no account, no daemon, no hosted service',
      ],
      tech: ['Node.js', 'Claude Code', 'SSH', 'E2B', 'Git'],
      links: { live: 'https://www.npmjs.com/package/ccbeam', github: 'https://github.com/sahilmahendrakar/ccbeam' },
    },
    {
      id: 'lyrn-code', name: 'Lyrn Code', image: 'img/lyrncode.jpg',
      tagline: 'AI-powered personalized coding tutor',
      bullets: [
        'Skills matrix with adaptive practice and real-time evaluation',
        'Agent-driven tutoring with function calling and session memory',
      ],
      tech: ['Next.js', 'TypeScript', 'LangChain', 'OpenAI', 'Firebase'],
      links: { live: 'https://www.lyrncode.com' },
    },
    {
      id: 'context-overflow', name: 'Context Overflow', image: 'img/context-overflow.jpg',
      tagline: 'A shared knowledge network for AI coding agents',
      bullets: [
        'Agents search, ask, and share solutions to avoid solving the same problems repeatedly',
        'Supports web UI, REST API, MCP protocol, CLI, and agent skills',
      ],
      tech: ['Next.js', 'TypeScript', 'Firebase', 'Google GenAI', 'MCP'],
      links: { live: 'https://ctxoverflow.dev', github: 'https://github.com/sahilmahendrakar/context-overflow' },
    },
    {
      id: 'boomie', name: 'Boomie', image: 'img/boomie.jpg',
      tagline: 'Personalized, AI-powered album recommendations',
      bullets: [
        'Rate albums and build a personal listening profile',
        'Agent-based recommendations with Spotify integration for album search and metadata',
      ],
      tech: ['Next.js', 'TypeScript', 'Google Gemini', 'Spotify API', 'Firebase'],
      links: { live: 'https://listenboomie.com', github: 'https://github.com/sahilmahendrakar/boomie' },
    },
    {
      id: 'waves', name: 'Waves', image: 'img/waves.jpg',
      tagline: 'Adaptive AI-generated music for focus sessions on macOS',
      bullets: [
        'Timed Wave sessions where music intensity follows a smooth curve — BPM, density, and prompts evolve with your session',
        'Voice steering: natural-language commands applied to the live Lyria Realtime stream',
      ],
      tech: ['Swift', 'Google Lyria Realtime', 'Gemini', 'WebSocket', 'macOS'],
      links: { live: 'https://listenwaves.com', github: 'https://github.com/sahilmahendrakar/waves' },
    },
  ],

  experience: [
    {
      title: 'Software Development Engineer', company: 'Amazon Web Services', period: 'Sept 2024 – Present',
      description: 'Building agentic AI on the Bedrock AgentCore team.',
      highlights: [
        'Building long-term memory for AI agents on Bedrock AgentCore Memory',
        'Previously delivered customer-facing cost optimization experiences (Compute Optimizer, Savings Plans, Cost Optimization Hub)',
      ],
    },
    {
      title: 'Software Development Engineer Intern', company: 'Amazon Web Services', period: 'May – Aug 2023',
      description: 'Built SQL Server license optimization feature for AWS Compute Optimizer.',
      highlights: ['Enabled customers to reduce license costs by up to 73%'],
    },
    {
      title: 'Co-founder & CTO', company: 'IronMill', period: 'Jun 2022 – Jan 2023',
      description: 'Led technical development for blockchain security startup.',
      highlights: ['Raised $1M pre-seed funding', 'Selected for Stanford Blockchain Accelerator'],
    },
    {
      title: 'Cybersecurity Research Intern', company: 'Westlight AI', period: 'Summer 2020 & 2021',
      description: 'Conducted cybersecurity research contributing to federal contracts.',
      highlights: ['Contributed to USAF SBIR Phase I and Phase II awards'],
    },
  ],
  education: { school: 'Columbia University', degree: 'B.S. Computer Science', gpa: '4.12/4.0', period: '2020 – 2024' },

  patents: [
    { number: 'U.S. Patent 12,250,316 B2', title: 'Zero-knowledge proof system selection', year: '2024', url: 'https://patents.google.com/patent/US12250316B2' },
    { number: 'U.S. Patent 11,295,029 B1', title: 'Filesystem interception and encryption enforcement', year: '2022', url: 'https://patents.google.com/patent/US11295029B1' },
  ],

  now: {
    focus: [
      'Building long-term memory for AI agents at AWS Bedrock AgentCore',
      'Building Fluxx & Context Overflow — tools for people working with coding agents',
      'Exploring multi-agent coordination and shared knowledge across agents',
    ],
    interests: ['Agent memory', 'Multi-agent systems', 'Agent-native tooling', 'Human–agent collaboration', 'Developer experience', 'System design'],
  },

  // Posts come from the Substack feed at build time on the real site.
  thoughts: { url: 'https://sahilmahendrakar.substack.com', label: 'Writing on Substack' },

  contact: [
    { label: 'Email', href: 'mailto:sahil.mahendrakar@gmail.com', display: 'sahil.mahendrakar@gmail.com' },
    { label: 'GitHub', href: 'https://github.com/sahilmahendrakar', display: 'github.com/sahilmahendrakar' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sahil-mahendrakar/', display: 'linkedin.com/in/sahil-mahendrakar' },
    { label: 'X', href: 'https://x.com/sahilmdkr', display: 'x.com/sahilmdkr' },
    { label: 'Substack', href: 'https://sahilmahendrakar.substack.com', display: 'sahilmahendrakar.substack.com' },
  ],
};
