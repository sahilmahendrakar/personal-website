export function AboutContent() {
  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed">
        Hello, I'm Sahil. I'm a junior at Columbia University studying Computer Science.
      </p>
      <p className="text-muted-foreground leading-relaxed">
        I'm passionate about building products that make a difference. I love exploring 
        the intersection of AI and user experience, creating tools that feel intuitive 
        and powerful.
      </p>
      <div className="flex gap-4 pt-4">
        <a 
          href="https://github.com/sahilmahendrakar" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          GitHub
        </a>
        <a 
          href="https://www.linkedin.com/in/sahil-mahendrakar/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          LinkedIn
        </a>
      </div>
    </div>
  )
}

