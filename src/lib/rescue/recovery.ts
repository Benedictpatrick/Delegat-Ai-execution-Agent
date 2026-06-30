import { RescuePlan } from './contracts'
import { createFallbackRecovery } from './fallback'

export type GenerateJson = (prompt: string) => Promise<unknown>

export function createRecoveryAgent(generateJson: GenerateJson) {
  return {
    async recover(plan: RescuePlan, lostMinutes: number) {
      try {
        const prompt = `
You are the Delegat Recovery Agent. The user just lost ${lostMinutes} minutes and the deadline is in jeopardy.
Here is the current plan:
${JSON.stringify(plan)}

You must identify which remaining human_work or must_do tasks to drop or compress to recover the lost time.
DO NOT drop ai_execute tasks (they take 0 user time).

Return JSON matching:
{
  "lostMinutes": ${lostMinutes},
  "explanation": "Short 1-sentence explanation of what was dropped to recover the time.",
  "revisedConfidence": number (0-100),
  "changes": [
    {
      "taskId": "uuid string",
      "action": "drop" | "compress",
      "previousMinutes": number,
      "revisedMinutes": number,
      "rationale": "Why this was sacrificed"
    }
  ]
}
`
        const rawResult = await generateJson(prompt) as any
        
        if (!rawResult || !Array.isArray(rawResult.changes)) {
          throw new Error('Invalid model output')
        }

        return {
          lostMinutes,
          explanation: rawResult.explanation || 'Adjusted plan to account for lost time.',
          revisedConfidence: rawResult.revisedConfidence || 50,
          changes: rawResult.changes
        }
      } catch (error) {
        console.error('Recovery fallback triggered:', error)
        return createFallbackRecovery(plan, lostMinutes)
      }
    }
  }
}
