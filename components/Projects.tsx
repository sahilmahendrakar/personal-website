'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { ProjectCard } from './ProjectCard';
import { projects } from '@/lib/data/projects';

export function Projects() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);

    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : clientWidth;
    const gap = 24;
    const index = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(index, projects.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth
      : el.clientWidth;
    const gap = 24;
    const distance = direction === 'left' ? -(cardWidth + gap) : cardWidth + gap;
    el.scrollBy({ left: distance, behavior: 'smooth' });
  };

  return (
    <SectionWrapper id="projects" className="py-20 md:py-28">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Projects
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            AI-powered projects at the intersection of curiosity, learning, and discovery.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous project"
            className="p-2 rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.5 15L7.5 10L12.5 5" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next project"
            className="p-2 rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 5L12.5 10L7.5 15" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory -mx-6 px-6 pt-2 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            className="snap-start shrink-0 w-[85%] md:w-[calc(50%-12px)]"
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-4 md:hidden">
        {projects.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to project ${i + 1}`}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              const cardWidth = el.firstElementChild
                ? (el.firstElementChild as HTMLElement).offsetWidth
                : el.clientWidth;
              const gap = 24;
              el.scrollTo({ left: i * (cardWidth + gap), behavior: 'smooth' });
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === activeIndex ? 'bg-foreground' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
