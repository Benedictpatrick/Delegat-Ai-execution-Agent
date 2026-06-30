"use client";

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { useCommitmentStore } from "@/store/useCommitmentStore"

export function NewCommitmentInput() {
  const [input, setInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { fetchData, addCommitment, addNexusItem } = useCommitmentStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSubmitting) return

    const rawInput = input.trim()
    setInput("")
    setIsSubmitting(true)
    
    // Optimistic: show the commitment immediately
    const fakeId = "temp-" + Date.now()
    addCommitment({
      id: fakeId,
      user_id: "local",
      title: rawInput,
      raw_input: rawInput,
      status: "processing",
      source_type: "text",
      importance: 3,
      type: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deadline: null,
      health_score: 100,
      stakeholders: [],
      metadata: {},
      tags: [],
      confidence_score: null,
      completed_at: null,
      deleted_at: null
    } as any)

    // Show "analyzing" in the feed
    addNexusItem({
      id: Math.random().toString(),
      type: 'system',
      title: 'Analyzing with Gemini...',
      details: `Processing: "${rawInput.substring(0, 40)}"`,
      status: 'success',
      created_at: new Date().toISOString()
    })

    try {
      const res = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_input: rawInput })
      })

      if (res.ok) {
        const data = await res.json()
        // Show success in feed
        addNexusItem({
          id: Math.random().toString(),
          type: 'commitment_decomposed',
          title: data.ai_powered ? 'Gemini Analysis Complete' : 'Goal Analyzed',
          details: `Created ${data.tasks_created} tasks for "${data.commitment?.title || rawInput}"`,
          status: 'success',
          created_at: new Date().toISOString()
        })
        // Refresh real data from DB
        setTimeout(() => fetchData(), 500)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to create commitment:', res.status, errorData)
        addNexusItem({
          id: Math.random().toString(),
          type: 'error',
          title: 'Execution Error',
          details: errorData.error || `Status: ${res.status}`,
          status: 'error',
          created_at: new Date().toISOString()
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(err)
      addNexusItem({
        id: Math.random().toString(),
        type: 'error',
        title: 'Network Error',
        details: message,
        status: 'error',
        created_at: new Date().toISOString()
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl group mt-4">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <div className={`w-2 h-2 rounded-full transition-colors ${isSubmitting ? 'bg-warning animate-ping' : 'bg-primary animate-pulse shadow-[0_0_6px_rgba(99,102,241,0.5)]'}`} />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isSubmitting ? "Gemini is analyzing your goal..." : "Type a goal... (e.g. 'Research paper due Wednesday')"}
        className="w-full pl-10 pr-12 py-3.5 bg-card border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={!input.trim() || isSubmitting}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <div className={`p-2 rounded-lg transition-all ${input.trim() && !isSubmitting ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-muted/50 text-muted-foreground'}`}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </div>
      </button>
    </form>
  )
}
