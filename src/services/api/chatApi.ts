export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export async function sendChatMessage(messages: ChatMessage[], context?: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  })
  const data = await res.json()
  if (!res.ok || !data.success) {
    throw new Error(data.detail || data.error || 'Chat failed')
  }
  return data.reply as string
}
