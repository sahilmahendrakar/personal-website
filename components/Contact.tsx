import { SectionWrapper } from './SectionWrapper';
import { AnimatedLink } from './AnimatedLink';

const links = [
  {
    label: 'Email',
    href: 'mailto:sahil.mahendrakar@gmail.com',
    display: 'sahil.mahendrakar@gmail.com',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/sahil-mahendrakar/',
    display: 'linkedin.com/in/sahil-mahendrakar',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/sahilmahendrakar',
    display: 'github.com/sahilmahendrakar',
  },
];

export function Contact() {
  return (
    <SectionWrapper id="contact" className="py-20 md:py-28">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        Contact
      </h2>
      <p className="text-muted-foreground text-lg mb-10 max-w-xl">
        If you&apos;re building in AI + learning, I&apos;d love to chat. Always happy to connect 
        with people working on interesting problems.
      </p>
      
      <div className="space-y-4">
        {links.map((link) => (
          <div key={link.label} className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground w-20">
              {link.label}
            </span>
            <AnimatedLink 
              href={link.href} 
              external={!link.href.startsWith('mailto')}
              className="text-lg"
            >
              {link.display}
            </AnimatedLink>
          </div>
        ))}
      </div>
      
      <div className="mt-16 pt-8 border-t border-border">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sahil Mahendrakar. Built with Next.js.
        </p>
      </div>
    </SectionWrapper>
  );
}
