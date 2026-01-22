import { SectionWrapper } from './SectionWrapper';

export function About() {
  return (
    <SectionWrapper id="about" className="py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">
        About
      </h2>
      
      <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-muted-foreground mt-1.5">→</span>
            <span>
              <strong className="font-medium">SDE at AWS</strong>
              <span className="text-muted-foreground"> — building customer-facing optimization and recommendation experiences</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-muted-foreground mt-1.5">→</span>
            <span>
              <strong className="font-medium">Former co-founder/CTO</strong>
              <span className="text-muted-foreground"> — raised $1M, Stanford Blockchain Accelerator</span>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-muted-foreground mt-1.5">→</span>
            <span>
              <strong className="font-medium">Building Aristotle & Lyrn Code</strong>
              <span className="text-muted-foreground"> — AI tools for reading and learning</span>
            </span>
          </li>
        </ul>
        
        <p className="text-muted-foreground leading-relaxed text-lg">
        I’m a product-minded engineer interested in tools for thought that make learning clearer, deeper, and more engaging.
        I build across the stack, from system design to UI/UX. Lately, I’ve been interested in AI tools that augment our thinking and learning process rather than replace it.
        </p>
      </div>
    </SectionWrapper>
  );
}
