import type { Project } from '@/lib/data/projects';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Get primary link (prioritize live, then demo, then writeup)
  const primaryLink = project.links.live || project.links.demo || project.links.writeup;
  const isExternal = !!(project.links.live || project.links.demo);

  return (
    <a
      href={primaryLink}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group relative block p-6 md:p-8 rounded-xl border border-border bg-card hover:border-muted-foreground/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <article className="flex flex-col h-full">
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-muted-foreground text-lg">
            {project.tagline}
          </p>
        </div>
        
        <ul className="space-y-3 mb-6 flex-grow">
          {project.bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-3 text-sm md:text-base">
              <span className="text-muted-foreground mt-1 flex-shrink-0">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        
        <div className="mb-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm">
            <span className="text-muted-foreground">Exploring: </span>
            <span>{project.exploring}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
        
        <div className="flex gap-4 pt-4 border-t border-border">
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
            View Project →
          </span>
        </div>
      </article>
    </a>
  );
}
