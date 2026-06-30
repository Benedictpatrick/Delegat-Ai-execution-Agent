export type TaskLane = 'must_do' | 'ai_execute' | 'human_work' | 'drop'
export type ArtifactType = 'brief' | 'outline' | 'email_draft'

export interface RescueBrief {
  commitment: string
  deadline: string
  availableMinutes: number
  constraints: string[]
}

export interface RescueTask {
  id: string
  title: string
  lane: TaskLane
  estimatedMinutes: number
  priority: number
  rationale: string
  dependsOn: string[]
}

export interface ArtifactRequest {
  id: string
  taskId: string
  type: ArtifactType
  title: string
  instructions: string
}

export interface RescuePlan {
  id: string
  title: string
  deadline: string
  summary: string
  requiredMinutes: number
  availableMinutes: number
  recoveredMinutes: number
  confidence: number
  riskExplanation: string
  tasks: RescueTask[]
  artifacts: ArtifactRequest[]
  source: 'groq' | 'gemini' | 'fallback'
}

type ValidationResult<T> = { success: true; data: T } | { success: false; errors: string[] }

export function jsonSuccess<T>(data: T): ValidationResult<T> {
  return { success: true, data }
}

export function jsonFailure<T>(errors: string[]): ValidationResult<T> {
  return { success: false, errors }
}

export function validateRescueBrief(input: any): ValidationResult<RescueBrief> {
  const errors: string[] = []

  if (!input || typeof input !== 'object') {
    return jsonFailure(['Input must be an object'])
  }

  if (typeof input.commitment !== 'string' || input.commitment.trim() === '') {
    errors.push('Commitment must be a non-empty string')
  }

  if (typeof input.deadline !== 'string' || isNaN(Date.parse(input.deadline))) {
    errors.push('Deadline must be a valid ISO date string')
  } else if (new Date(input.deadline).getTime() <= Date.now()) {
    errors.push('Deadline must be in the future')
  }

  if (!Number.isFinite(input.availableMinutes) || input.availableMinutes <= 0) {
    errors.push('Available minutes must be a positive number')
  }

  if (!Array.isArray(input.constraints) || !input.constraints.every((c: any) => typeof c === 'string')) {
    errors.push('Constraints must be an array of strings')
  }

  if (errors.length > 0) return jsonFailure(errors)

  return jsonSuccess({
    commitment: input.commitment,
    deadline: input.deadline,
    availableMinutes: input.availableMinutes,
    constraints: input.constraints
  })
}

export function validateRescuePlan(input: any): ValidationResult<RescuePlan> {
  const errors: string[] = []

  if (!input || typeof input !== 'object') {
    return jsonFailure(['Input must be an object'])
  }

  const validLanes = new Set(['must_do', 'ai_execute', 'human_work', 'drop'])
  
  if (!Array.isArray(input.tasks)) {
    errors.push('Tasks must be an array')
  } else {
    const taskIds = new Set<string>()
    for (const task of input.tasks) {
      if (taskIds.has(task.id)) {
        errors.push(`Duplicate task ID: ${task.id}`)
      }
      taskIds.add(task.id)
      
      if (!validLanes.has(task.lane)) {
        errors.push(`Unknown classification lane: ${task.lane}`)
      }
    }
  }

  if (Array.isArray(input.artifacts)) {
    const taskIds = new Set((input.tasks || []).map((t: any) => t.id))
    for (const artifact of input.artifacts) {
      if (!taskIds.has(artifact.taskId)) {
        errors.push(`Artifact requests source task not found: ${artifact.taskId}`)
      }
    }
  }

  if (errors.length > 0) return jsonFailure(errors)

  return jsonSuccess(input as RescuePlan)
}
