"use client"

import { PanelManagerProvider } from "@/hooks/use-panel-manager"
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { Chat } from "@/components/chat/chat"

export default function Home() {
  return (
    <PanelManagerProvider>
      <WorkspaceLayout>
        <Chat />
      </WorkspaceLayout>
    </PanelManagerProvider>
  )
}
