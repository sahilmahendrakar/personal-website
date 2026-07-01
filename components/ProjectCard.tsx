'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Project } from '@/lib/data/projects';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Get primary link (prioritize live, then demo, then writeup)
  const primaryLink = project.links.live || project.links.demo || project.links.writeup;
  const isExternal = !!(project.links.live || project.links.demo);
  const [isExpanded, setIsExpanded] = useState(false);
  const bulletListId = `project-bullets-${project.id}`;

  return (
    <div className="group relative block p-6 md:p-8 rounded-xl border border-border bg-card hover:border-muted-foreground/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <article className="flex flex-col h-full">
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} on GitHub`}
                onClick={(event) => event.stopPropagation()}
                className="flex-shrink-0 mt-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.57 22.29 24 17.79 24 12.5 24 5.87 18.63.5 12 .5z" />
                </svg>
              </a>
            )}
          </div>
          <p className="text-muted-foreground text-lg">
            {project.tagline}
          </p>
        </div>

        {project.image && (
          <div className="relative w-full aspect-video overflow-hidden rounded-lg mb-6">
            <Image
              src={project.image}
              alt={`${project.name} preview`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[1000px] mb-6' : 'max-h-0 mb-0'
          }`}
        >
          <ul id={bulletListId} className="space-y-3">
            {project.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3 text-sm md:text-base">
                <span className="text-muted-foreground mt-1 flex-shrink-0">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* <div className="mb-6 p-4 rounded-lg bg-muted/50">
          <p className="text-sm">
            <span className="text-muted-foreground">Exploring: </span>
            <span>{project.exploring}</span>
          </p>
        </div> */}
        
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            type="button"
            aria-label={isExpanded ? 'Hide project details' : 'Show project details'}
            aria-expanded={isExpanded}
            aria-controls={bulletListId}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
            >
              <path d="M5 7.5L10 12.5L15 7.5" />
            </svg>
            <span>More details</span>
          </button>
          {primaryLink ? (
            <a
              href={primaryLink}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="ml-auto inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Project →
            </a>
          ) : null}
        </div>
      </article>
    </div>
  );
}
