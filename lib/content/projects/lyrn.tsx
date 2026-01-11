export function LyrnProjectContent() {
  return (
    <div className="space-y-6">
      <p className="text-lg leading-relaxed">
        Lyrn is an AI-powered coding tutor that helps students learn programming 
        through interactive problem-solving.
      </p>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Key Features</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>AI tutor that guides without giving away answers</li>
            <li>Interactive workspace with code editor and test cases</li>
            <li>Curated problem sets for learning</li>
            <li>Real-time code execution and feedback</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">Tech Stack</h3>
          <p className="text-muted-foreground">
            Next.js, TypeScript, AI SDK, Firebase, Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  )
}

