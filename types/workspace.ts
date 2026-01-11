import type { ComponentType } from "react"

export type PanelId = string

export interface PanelState {
  activePanel: PanelId | null
}

export interface PanelContent {
  title: string
  component: ComponentType
}

export interface PanelManagerContextValue {
  activePanel: PanelId | null
  openPanel: (id: PanelId) => void
  closePanel: () => void
}

