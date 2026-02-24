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
    <a
      href={primaryLink}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="group relative block p-6 md:p-8 rounded-xl border border-border bg-card hover:border-muted-foreground/30 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <article className="flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
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
            isExpanded ? 'max-h-96 mb-6' : 'max-h-0 mb-0'
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
          <span className="ml-auto inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            View Project →
          </span>
        </div>
      </article>
    </a>
  );
}
