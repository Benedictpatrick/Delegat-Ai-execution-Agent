import { RescueTask } from './contracts'

export function calculateConfidence({
  requiredMinutes,
  availableMinutes,
  completedMinutes,
  riskPenalty
}: {
  requiredMinutes: number
  availableMinutes: number
  completedMinutes: number
  riskPenalty: number
}): number {
  if (requiredMinutes === 0) return 100

  const ratio = (availableMinutes + completedMinutes) / Math.max(requiredMinutes, 1)
  const score = Math.round(ratio * 100) - riskPenalty
  
  return Math.min(Math.max(score, 5), 100)
}

export function sumActiveMinutes(tasks: RescueTask[]): number {
  return tasks
    .filter(t => t.lane !== 'drop')
    .reduce((sum, t) => sum + t.estimatedMinutes, 0)
}

export function sumRecoveredMinutes(tasks: RescueTask[]): number {
  return tasks
    .filter(t => t.lane === 'drop')
    .reduce((sum, t) => sum + t.estimatedMinutes, 0)
}
