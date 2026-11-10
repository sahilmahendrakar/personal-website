import { SectionWrapper } from './SectionWrapper';
import { publications } from '@/lib/data/publications';

export function Publications() {
  return (
    <SectionWrapper id="publications" className="py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
        Publications
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {publications.map((publication) => {
          const CardWrapper = publication.url ? 'a' : 'div';
          const cardProps = publication.url
            ? {
                href: publication.url,
                target: '_blank' as const,
                rel: 'noopener noreferrer',
              }
            : {};

          return (
            <CardWrapper
              key={publication.id}
              {...cardProps}
              className={`group block p-6 rounded-lg border border-border bg-card transition-all duration-300 ${
                publication.url ? 'hover:border-muted-foreground/30 hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''
              }`}
            >
              <p className="text-xs font-mono text-muted-foreground mb-2">
                {publication.number}
              </p>
              <h3 className={`text-lg font-semibold mb-2 ${publication.url ? 'group-hover:text-primary transition-colors' : ''}`}>
                {publication.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {publication.description}
              </p>
              {publication.url && (
                <span className="inline-flex items-center px-3 py-1.5 mt-4 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  {publication.kind === 'paper' ? 'View Paper' : 'View Patent'} →
                </span>
              )}
            </CardWrapper>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
