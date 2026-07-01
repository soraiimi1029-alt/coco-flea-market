"use client"

import React, { useState } from "react"

type Message = { id: number; role: "user" | "claude"; text: string }

export default function ClaudeMockPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "claude", text: "こんにちは！Claude（モック）です。質問をどうぞ。" },
  ])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)

  const send = () => {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now(), role: "user", text: input.trim() }
    setMessages((p) => [...p, userMsg])
    setInput("")
    setSending(true)

    setTimeout(() => {
      const responseText = `（モックClaudeの応答）「${userMsg.text}」について、簡単に言うと：短くて分かりやすい説明をここに入れます。`;
      const claudeMsg: Message = { id: Date.now() + 1, role: "claude", text: responseText }
      setMessages((p) => [...p, claudeMsg])
      setSending(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-lg font-semibold">Claude（モック）</h1>
          <p className="text-sm text-gray-500">これはモック表示です。実際のClaudeではありません。</p>
        </div>

        <div className="p-4 h-[60vh] overflow-auto space-y-4" id="messages">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
              <div className={`inline-block px-4 py-2 rounded-lg ${m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send() }}
            className="flex-1 border rounded px-3 py-2"
            placeholder="メッセージを入力..."
          />
          <button onClick={send} disabled={sending} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {sending ? "送信中..." : "送信"}
          </button>
        </div>
      </div>
    </div>
  )
}
