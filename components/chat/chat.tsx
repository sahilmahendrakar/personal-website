"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
import { usePanelManager } from "@/hooks/use-panel-manager"
import { ChatInput } from "./chat-input"
import { Message } from "./message"

export function Chat() {
  const [input, setInput] = useState("")
  const { openPanel } = usePanelManager()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    api: "/api/chat",
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "open_panel") {
        const args = toolCall.args as { panelId: string }
        openPanel(args.panelId)
      }
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const isLoading = status === "streaming"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    sendMessage({ text: input.trim() })
    setInput("")
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-3">
                Hi, I'm Sahil
              </h1>
              <p className="text-muted-foreground">
                Ask me anything about my work, projects, or background.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
