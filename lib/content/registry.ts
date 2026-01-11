import type { PanelContent } from "@/types/workspace"
import { AboutContent } from "./about"
import { LyrnProjectContent } from "./projects/lyrn"

export const contentRegistry: Record<string, PanelContent> = {
  "about-me": {
    title: "About Me",
    component: AboutContent,
  },
  "lyrn-project": {
    title: "Lyrn",
    component: LyrnProjectContent,
  },
}

export function getPanelContent(id: string): PanelContent | null {
  return contentRegistry[id] ?? null
}

export function getAvailablePanelIds(): string[] {
  return Object.keys(contentRegistry)
}

