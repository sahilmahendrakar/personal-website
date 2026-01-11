"use client"

import { useRef, useEffect } from "react"
import type { ImperativePanelHandle } from "react-resizable-panels"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { usePanelManager } from "@/hooks/use-panel-manager"
import { usePanelAnimation } from "@/hooks/use-panel-animation"
import { ContentPanel } from "./content-panel"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import type { ReactNode } from "react"

interface WorkspaceLayoutProps {
  children: ReactNode
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const { activePanel } = usePanelManager()
  const { animatePanelResize } = usePanelAnimation()
  const contentPanelRef = useRef<ImperativePanelHandle>(null)
  const prevActivePanel = useRef<string | null>(null)

  useEffect(() => {
    if (!contentPanelRef.current) return

    const wasOpen = prevActivePanel.current !== null
    const isOpen = activePanel !== null

    if (wasOpen !== isOpen) {
      const targetSize = isOpen ? 50 : 0
      if (targetSize === 0) {
        contentPanelRef.current.resize(0)
      } else {
        animatePanelResize(contentPanelRef.current, targetSize)
      }
    }

    prevActivePanel.current = activePanel
  }, [activePanel, animatePanelResize])

  return (
    <div className="h-screen flex flex-col">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={activePanel ? 50 : 100} minSize={30}>
          <div className="h-full p-4">
            {children}
          </div>
        </ResizablePanel>

        {activePanel && <ResizableHandle withHandle />}

        <ResizablePanel
          ref={contentPanelRef}
          defaultSize={activePanel ? 50 : 0}
          minSize={0}
          collapsible
        >
          <ContentPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
