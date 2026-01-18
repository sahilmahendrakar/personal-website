import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projects } from '@/lib/data/projects';
import { AnimatedLink } from '@/components/AnimatedLink';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.id,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  
  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: project.name,
    description: project.tagline,
  };
}

// Extended project details for detailed pages
const projectDetails: Record<string, {
  problem: string;
  approach: string;
  features: string[];
  techDetails: string;
  learnings: string[];
}> = {
  'aristotle': {
    problem: 'Reading complex books is challenging. Readers often have questions about context, characters, or concepts, but traditional tools either spoil the story or provide irrelevant information.',
    approach: 'Built an AI-powered e-reader that understands your current reading position and provides contextual answers without spoilers. Uses a RAG pipeline with metadata-aware retrieval to ensure responses are grounded in only what you\'ve read.',
    features: [
      'Position-aware Q&A that respects your reading progress',
      'Inline insights for complex passages',
      'Guided exploration mode for deeper understanding',
      'Book upload and processing with automatic chapter detection',
      'Cross-reference system for recurring themes and characters',
    ],
    techDetails: 'Next.js frontend with React Server Components, Pinecone for vector storage, OpenAI embeddings, Vercel AI SDK for streaming responses, Firebase for auth and storage. Custom chunking strategy that preserves narrative structure.',
    learnings: [
      'Retrieval quality matters more than model size for domain-specific Q&A',
      'Metadata-aware chunking dramatically improves answer relevance',
      'Users prefer concise, contextual answers over comprehensive ones',
    ],
  },
  'lyrn-code': {
    problem: 'Learning to code is often frustrating because feedback is delayed, practice is generic, and tutoring is expensive. Existing platforms don\'t adapt to individual learning patterns.',
    approach: 'Built an AI tutor that maintains a skills matrix, provides adaptive practice problems, and offers real-time evaluation with personalized feedback. Uses agent-driven tutoring with function calling to provide an interactive learning experience.',
    features: [
      'Dynamic skills matrix tracking proficiency across concepts',
      'Adaptive problem generation based on skill gaps',
      'Real-time code evaluation with detailed feedback',
      'Session memory for contextual follow-up questions',
      'Multi-panel workspace for seamless learning flow',
    ],
    techDetails: 'Next.js with TypeScript, LangChain for agent orchestration, OpenAI function calling for structured interactions, Firebase for user data and progress tracking. Custom evaluation pipeline that assesses both correctness and code quality.',
    learnings: [
      'Function calling enables much richer agent interactions than pure chat',
      'Skills matrices need careful calibration to feel accurate to users',
      'Memory and context are crucial for tutoring to feel personalized',
    ],
  },
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  const details = projectDetails[slug];

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <article className="mx-auto max-w-3xl px-6 md:px-8 py-20 md:py-28">
        <div className="mb-12">
          <Link
            href="/#projects"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to projects
          </Link>
        </div>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            {project.name}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {project.tagline}
          </p>
          {project.links.live && (
            <AnimatedLink
              href={project.links.live}
              external
              className="inline-flex items-center gap-2 text-sm font-medium"
            >
              Visit {project.name} →
            </AnimatedLink>
          )}
        </header>

        {details ? (
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">
                The Problem
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {details.problem}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">
                Approach
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {details.approach}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">
                Key Features
              </h2>
              <ul className="space-y-3">
                {details.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">
                Tech Stack
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {details.techDetails}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight mb-4">
                What I Learned
              </h2>
              <ul className="space-y-3">
                {details.learnings.map((learning, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-1">→</span>
                    <span>{learning}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          <div className="space-y-8">
            <ul className="space-y-3">
              {project.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm">
                <span className="text-muted-foreground">Currently exploring: </span>
                <span>{project.exploring}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-border">
          <Link
            href="/#projects"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to all projects
          </Link>
        </footer>
      </article>
    </main>
  );
}
