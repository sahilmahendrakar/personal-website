'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { experiences, education } from '@/lib/data/experience';
import { AnimatedLink } from './AnimatedLink';

export function Timeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [fillHeight, setFillHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const timelineHeight = rect.height;
      
      // Calculate how much of the timeline is above the viewport center
      const scrollProgress = Math.max(0, Math.min(1, 
        (windowHeight * 0.6 - rect.top) / timelineHeight
      ));
      
      setFillHeight(scrollProgress * 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <SectionWrapper id="experience" className="py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        Experience
      </h2>
      <p className="text-muted-foreground text-lg mb-10">
        {education.school} · {education.degree} · {education.gpa}
      </p>
      
      <div ref={timelineRef} className="relative pl-8">
        {/* Timeline line */}
        <div className="timeline-line">
          <div 
            className="timeline-line-fill"
            style={{ height: `${fillHeight}%` }}
          />
        </div>
        
        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="relative">
              {/* Timeline dot */}
              <div 
                className={`timeline-dot absolute -left-8 top-1 ${
                  fillHeight > (index / experiences.length) * 100 ? 'active' : ''
                }`}
              />
              
              <div className="pb-2">
                <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                  <h3 className="text-xl font-semibold">
                    {exp.title}
                  </h3>
                  <span className="text-sm text-muted-foreground md:ml-4">
                    {exp.period}
                  </span>
                </div>
                
                <p className="text-muted-foreground mb-3">
                  {exp.companyUrl ? (
                    <AnimatedLink href={exp.companyUrl} external>
                      {exp.company}
                    </AnimatedLink>
                  ) : (
                    exp.company
                  )}
                </p>
                
                <p className="text-muted-foreground mb-4">
                  {exp.description}
                </p>
                
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="space-y-2">
                    {exp.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
                
                {exp.tags && exp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {exp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-md bg-secondary text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
