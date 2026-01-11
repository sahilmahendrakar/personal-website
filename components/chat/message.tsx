"use client"

import type { UIMessage } from "ai"

interface MessageProps {
  message: UIMessage
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user"

  const textContent = message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("") || ""

  if (!textContent) return null

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{textContent}</p>
      </div>
    </div>
  )
}
