import { RescueBrief, RescuePlan, validateRescuePlan } from './contracts'
import { createFallbackPlan } from './fallback'
import { calculateConfidence } from './scoring'
import crypto from 'crypto'

export type GenerateJson = (prompt: string) => Promise<unknown>

export function createPlanner(generateJson: GenerateJson) {
  return {
    async plan(brief: RescueBrief): Promise<RescuePlan> {
      try {
        const prompt = `
You are the Delegat Deadline Rescue Planner. A user is facing an impossible deadline and needs a ruthless triage plan.
Given their rescue brief (commitment, deadline, available hours, constraints), analyze the feasibility and propose a minimum viable rescue plan.

Return a JSON object strictly matching this schema:
{
  "title": "Clear concise title",
  "summary": "1 sentence summary of the strategy",
  "riskExplanation": "Concise 1-2 sentence explanation of the risk and tradeoffs",
  "tasks": [
    {
      "id": "uuid string",
      "title": "Actionable task",
      "lane": "must_do" | "ai_execute" | "human_work" | "drop",
      "estimatedMinutes": number,
      "priority": number (1-5),
      "rationale": "Explicit tradeoff rationale",
      "dependsOn": ["array of task ids"]
    }
  ],
  "artifacts": [
    {
      "id": "uuid string",
      "taskId": "must match an ai_execute task id",
      "type": "brief" | "outline" | "email_draft",
      "title": "Artifact title",
      "instructions": "Prompt instructions for the maker agent"
    }
  ]
}

Rules:
- DO NOT claim to execute actions externally (e.g. "I will email your boss").
- At least one ai_execute and one drop task must be included.

Input:
${JSON.stringify(brief)}
        `

        const rawResult = await generateJson(prompt) as any
        
        // Build the full plan format and recalculate metrics to override model arithmetic
        if (!rawResult || typeof rawResult !== 'object' || !Array.isArray(rawResult.tasks)) {
          throw new Error('Invalid model output')
        }

        const requiredMinutes = rawResult.tasks.filter((t: any) => t.lane !== 'drop').reduce((s: number, t: any) => s + (t.estimatedMinutes || 0), 0)
        const recoveredMinutes = rawResult.tasks.filter((t: any) => t.lane === 'drop').reduce((s: number, t: any) => s + (t.estimatedMinutes || 0), 0)
        const confidence = calculateConfidence({
          requiredMinutes,
          availableMinutes: brief.availableMinutes,
          completedMinutes: 0,
          riskPenalty: 10
        })

        // Always generate fresh UUIDs — AI returns non-UUID ids like "must-do-1"
        const taskIdMap = new Map<string, string>()
        const tasks = rawResult.tasks.map((t: any) => {
          const newId = crypto.randomUUID()
          taskIdMap.set(String(t.id), newId)
          return { ...t, id: newId }
        })
        const artifacts = (rawResult.artifacts || []).map((a: any) => ({
          ...a,
          id: crypto.randomUUID(),
          taskId: taskIdMap.get(String(a.taskId)) || crypto.randomUUID(),
        }))

        const planCandidate = {
          id: crypto.randomUUID(),
          title: rawResult.title || brief.commitment,
          deadline: brief.deadline,
          summary: rawResult.summary || '',
          requiredMinutes,
          availableMinutes: brief.availableMinutes,
          recoveredMinutes,
          confidence,
          riskExplanation: rawResult.riskExplanation || '',
          tasks,
          artifacts,
          source: (rawResult._aiSource || 'gemini') as 'groq' | 'gemini',
        }

        const validation = validateRescuePlan(planCandidate)
        if (!validation.success) {
          throw new Error('Model produced invalid plan shape: ' + validation.errors.join(', '))
        }

        return validation.data

      } catch (err) {
        console.error('Planner Gemini fallback triggered:', err)
        return createFallbackPlan(brief)
      }
    }
  }
}
