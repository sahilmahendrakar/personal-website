"use client"

import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { FormEvent, KeyboardEvent } from "react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  isLoading?: boolean
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
        <div className="flex items-end gap-2 bg-muted/50 backdrop-blur-sm rounded-2xl border border-border px-4 py-3">
          <Textarea
            placeholder="Ask me anything..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 min-h-[44px] max-h-[200px] py-2 px-0 resize-none"
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!value.trim() || isLoading}
            className="rounded-full shrink-0 h-9 w-9"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
