"use client"

import { useCallback } from "react"
import type { ImperativePanelHandle } from "react-resizable-panels"

export function usePanelAnimation() {
  const animatePanelResize = useCallback(
    (panelRef: ImperativePanelHandle, targetSize: number, duration: number = 400) => {
      const startSize = panelRef.getSize()
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)

        const currentSize = startSize + (targetSize - startSize) * easeOut
        panelRef.resize(currentSize)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    },
    []
  )

  return { animatePanelResize }
}
