import { RescueBrief, RescuePlan, RescueTask, ArtifactRequest } from './contracts'
import { calculateConfidence } from './scoring'

export function createFallbackPlan(brief: RescueBrief): RescuePlan {
  const t1Id = crypto.randomUUID()
  const t2Id = crypto.randomUUID()
  const t3Id = crypto.randomUUID()
  const t4Id = crypto.randomUUID()
  const t5Id = crypto.randomUUID()
  
  const tasks: RescueTask[] = [
    { id: t1Id, title: 'Draft presentation outline', lane: 'ai_execute', estimatedMinutes: 20, priority: 5, rationale: 'Delegat can draft this instantly to save time.', dependsOn: [] },
    { id: t2Id, title: 'Review and adjust outline', lane: 'human_work', estimatedMinutes: 30, priority: 4, rationale: 'Requires human verification of facts.', dependsOn: [t1Id] },
    { id: t3Id, title: 'Write email to professor', lane: 'ai_execute', estimatedMinutes: 10, priority: 3, rationale: 'Delegat can handle the communication.', dependsOn: [] },
    { id: t4Id, title: 'Rehearse speaking points', lane: 'must_do', estimatedMinutes: 30, priority: 5, rationale: 'Crucial for a smooth delivery.', dependsOn: [t2Id] },
    { id: t5Id, title: 'Create 10 visual slides', lane: 'drop', estimatedMinutes: 120, priority: 1, rationale: 'No time for visual design. Focus on content.', dependsOn: [] }
  ]
  
  const artifacts: ArtifactRequest[] = [
    { id: crypto.randomUUID(), taskId: t1Id, type: 'outline', title: 'Presentation Outline', instructions: 'Generate a detailed outline based on the constraints.' },
    { id: crypto.randomUUID(), taskId: t3Id, type: 'email_draft', title: 'Status Email', instructions: 'Draft an email explaining the situation.' }
  ]

  const requiredMinutes = tasks.filter(t => t.lane !== 'drop').reduce((sum, t) => sum + t.estimatedMinutes, 0)
  const recoveredMinutes = tasks.filter(t => t.lane === 'drop').reduce((sum, t) => sum + t.estimatedMinutes, 0)
  
  const confidence = calculateConfidence({
    requiredMinutes,
    availableMinutes: brief.availableMinutes,
    completedMinutes: 0,
    riskPenalty: 25 // Standard penalty for fallback
  })

  return {
    id: crypto.randomUUID(),
    title: brief.commitment || 'Rescue Plan',
    deadline: brief.deadline,
    summary: 'A deterministic fallback plan based on the inputs.',
    requiredMinutes,
    availableMinutes: brief.availableMinutes,
    recoveredMinutes,
    confidence,
    riskExplanation: 'Falling back to deterministic plan due to AI unavailability. Dropping major visual work.',
    tasks,
    artifacts,
    source: 'fallback'
  }
}

export function createFallbackRecovery(plan: RescuePlan, lostMinutes: number) {
  const changes = []
  let revisedConfidence = plan.confidence

  const targetTask = plan.tasks.find(t => t.lane === 'must_do' || t.lane === 'human_work')
  if (targetTask) {
    changes.push({
      taskId: targetTask.id,
      action: 'drop',
      previousMinutes: targetTask.estimatedMinutes,
      revisedMinutes: 0,
      rationale: `Dropped to recover ${lostMinutes} minutes of lost time.`
    })
    
    // Recalculate roughly
    const newRequired = plan.requiredMinutes - targetTask.estimatedMinutes
    revisedConfidence = calculateConfidence({
      requiredMinutes: newRequired,
      availableMinutes: Math.max(0, plan.availableMinutes - lostMinutes),
      completedMinutes: 0,
      riskPenalty: 35
    })
  } else {
    changes.push({
      taskId: plan.tasks[0]?.id || 'unknown',
      action: 'keep',
      previousMinutes: plan.tasks[0]?.estimatedMinutes || 0,
      revisedMinutes: plan.tasks[0]?.estimatedMinutes || 0,
      rationale: 'No viable tasks to drop in fallback mode.'
    })
  }

  return {
    lostMinutes,
    explanation: `Recovered ${lostMinutes} minutes by ruthlessly dropping remaining human tasks.`,
    revisedConfidence,
    changes
  }
}
