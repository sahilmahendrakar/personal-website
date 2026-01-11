"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { PanelId, PanelManagerContextValue } from "@/types/workspace"

const PanelManagerContext = createContext<PanelManagerContextValue | null>(null)

interface PanelManagerProviderProps {
  children: ReactNode
}

export function PanelManagerProvider({ children }: PanelManagerProviderProps) {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null)

  const openPanel = useCallback((id: PanelId) => {
    setActivePanel(id)
  }, [])

  const closePanel = useCallback(() => {
    setActivePanel(null)
  }, [])

  return (
    <PanelManagerContext.Provider value={{ activePanel, openPanel, closePanel }}>
      {children}
    </PanelManagerContext.Provider>
  )
}

export function usePanelManager() {
  const context = useContext(PanelManagerContext)
  if (!context) {
    throw new Error("usePanelManager must be used within a PanelManagerProvider")
  }
  return context
}

