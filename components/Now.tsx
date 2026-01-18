import { SectionWrapper } from './SectionWrapper';

const currentFocus = [
  'Building AI reading and learning tools (Aristotle, Lyrn Code)',
  'Exploring RAG architectures and retrieval optimization',
  'Developing AI-native interfaces that feel intuitive',
];

const interests = [
  'AI-native interfaces',
  'RAG systems',
  'Learning tools',
  'Developer experience',
  'Performance UX',
  'System design',
];

export function Now() {
  return (
    <SectionWrapper id="now" className="py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        Now
      </h2>
      <p className="text-muted-foreground text-lg mb-10">
        What I&apos;m currently focused on and interested in.
      </p>
      
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4">Current Focus</h3>
          <ul className="space-y-3">
            {currentFocus.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-muted-foreground mt-1">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-4 py-2 text-sm rounded-full border border-border bg-card hover:bg-muted transition-colors"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
