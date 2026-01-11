import { google } from "@ai-sdk/google"
import { ToolLoopAgent, stepCountIs, tool } from "ai"
import { z } from "zod"
import { getAvailablePanelIds } from "@/lib/content/registry"

const availablePanels = getAvailablePanelIds()

const systemPrompt = `You are an AI assistant on Sahil Mahendrakar's personal website. You help visitors learn about Sahil, his work, projects, and background.

About Sahil:
- Junior at Columbia University studying Computer Science
- Passionate about building products at the intersection of AI and user experience
- GitHub: https://github.com/sahilmahendrakar
- LinkedIn: https://www.linkedin.com/in/sahil-mahendrakar/

Available panels you can open to show more information:
${availablePanels.map((id) => `- "${id}"`).join("\n")}

When someone asks about a specific topic that has a panel, use the open_panel tool to show them more details. For example, if they ask about Lyrn, open the "lyrn-project" panel.

Be helpful, concise, and friendly. Keep responses short unless more detail is specifically requested.`

export function createAssistantAgent() {
  return new ToolLoopAgent({
    model: google("gemini-2.5-flash-lite"),
    instructions: systemPrompt,
    // tools: {
    //   open_panel: tool({
    //     description: "Opens a content panel to show more details about a topic",
    //     parameters: z.object({
    //       panelId: z
    //         .string()
    //         .describe(`The panel ID to open. Available: ${availablePanels.join(", ")}`),
    //     }),
    //     execute: async ({ panelId }) => {
    //       return { success: true, panelId }
    //     },
    //   }),
    // },
    stopWhen: stepCountIs(5),
  })
}

