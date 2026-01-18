import { SectionWrapper } from './SectionWrapper';
import { ProjectCard } from './ProjectCard';
import { projects } from '@/lib/data/projects';

export function Projects() {
  return (
    <SectionWrapper id="projects" className="py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        Projects
      </h2>
      <p className="text-muted-foreground text-lg mb-10 max-w-2xl">
        AI-powered tools I&apos;m building to help people learn and read more effectively.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </SectionWrapper>
  );
}
