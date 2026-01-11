import { createAssistantAgent } from "@/lib/agents/assistant"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const agent = createAssistantAgent()

  const lastMessage = messages[messages.length - 1]
  const prompt = lastMessage?.parts
    ?.filter((p: { type: string }) => p.type === "text")
    .map((p: { text: string }) => p.text)
    .join("\n") || ""

  const result = await agent.stream({ prompt })

  return result.toUIMessageStreamResponse()
}
