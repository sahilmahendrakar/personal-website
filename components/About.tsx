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
              <strong className="font-medium">Agentic AI at AWS</strong>
              <span className="text-muted-foreground"> — building long-term memory for agents on Bedrock AgentCore</span>
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
              <strong className="font-medium">Building agent-native tools</strong>
              <span className="text-muted-foreground"> — for people building alongside AI agents</span>
            </span>
          </li>
        </ul>
        
        <p className="text-muted-foreground leading-relaxed text-lg">
        I’m a product-minded engineer who builds across the stack, from system design to UI/UX.
        At AWS I work on long-term memory for AI agents; on my own time I build tools for people working alongside them. Lately, I’ve been focused on how humans and agents can build software together.
        </p>
      </div>
    </SectionWrapper>
  );
}
