import { SectionWrapper } from './SectionWrapper';
import { patents } from '@/lib/data/patents';

export function Patents() {
  return (
    <SectionWrapper id="patents" className="py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
        Patents
      </h2>
      
      <div className="grid gap-6 md:grid-cols-2">
        {patents.map((patent) => {
          const CardWrapper = patent.url ? 'a' : 'div';
          const cardProps = patent.url
            ? {
                href: patent.url,
                target: '_blank' as const,
                rel: 'noopener noreferrer',
              }
            : {};

          return (
            <CardWrapper
              key={patent.id}
              {...cardProps}
              className={`group block p-6 rounded-lg border border-border bg-card transition-all duration-300 ${
                patent.url ? 'hover:border-muted-foreground/30 hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''
              }`}
            >
              <p className="text-xs font-mono text-muted-foreground mb-2">
                {patent.number}
              </p>
              <h3 className={`text-lg font-semibold mb-2 ${patent.url ? 'group-hover:text-primary transition-colors' : ''}`}>
                {patent.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {patent.description}
              </p>
              {patent.url && (
                <span className="inline-flex items-center px-3 py-1.5 mt-4 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  View Patent →
                </span>
              )}
            </CardWrapper>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
