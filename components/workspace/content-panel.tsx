"use client"

import { X } from "lucide-react"
import { usePanelManager } from "@/hooks/use-panel-manager"
import { getPanelContent } from "@/lib/content/registry"
import { Button } from "@/components/ui/button"

export function ContentPanel() {
  const { activePanel, closePanel } = usePanelManager()

  if (!activePanel) return null

  const content = getPanelContent(activePanel)
  if (!content) return null

  const ContentComponent = content.component

  return (
    <div className="h-full p-4">
      <div className="h-full rounded-xl border border-border bg-muted/30 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-medium">{content.title}</h2>
          <Button variant="ghost" size="icon" onClick={closePanel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto px-6 py-4">
          <ContentComponent />
        </div>
      </div>
    </div>
  )
}

