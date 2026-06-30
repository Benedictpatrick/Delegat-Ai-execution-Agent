import { describe, it, expect, vi } from 'vitest';
import { createPlanner } from './planner';
import { RescueBrief } from './contracts';

describe('Planner', () => {
  it('returns valid plan when model returns valid data', async () => {
    const generateJson = vi.fn().mockResolvedValue({
      title: 'Valid Plan',
      summary: 'Summary here',
      riskExplanation: 'High risk',
      tasks: [
        { id: 't1', title: 'Task 1', lane: 'must_do', estimatedMinutes: 30, priority: 5, rationale: 'R', dependsOn: [] },
        { id: 't2', title: 'Task 2', lane: 'ai_execute', estimatedMinutes: 10, priority: 5, rationale: 'R', dependsOn: [] }
      ],
      artifacts: [
        { id: 'a1', taskId: 't2', type: 'brief', title: 'Art 1', instructions: 'Inst' }
      ]
    });

    const planner = createPlanner(generateJson);
    const brief: RescueBrief = {
      commitment: 'Demo',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      availableMinutes: 120,
      constraints: []
    };

    const plan = await planner.plan(brief);
    
    expect(plan.source).toBe('gemini');
    expect(plan.requiredMinutes).toBe(40);
    expect(plan.recoveredMinutes).toBe(0);
    expect(plan.title).toBe('Valid Plan');
  });

  it('falls back to deterministic plan on invalid JSON or missing fields', async () => {
    const generateJson = vi.fn().mockResolvedValue({
      title: 'Invalid Plan missing tasks'
    });

    const planner = createPlanner(generateJson);
    const brief: RescueBrief = {
      commitment: 'Demo',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      availableMinutes: 120,
      constraints: []
    };

    const plan = await planner.plan(brief);
    
    expect(plan.source).toBe('fallback');
    expect(plan.tasks.length).toBeGreaterThan(0);
  });

  it('falls back on timeout or network error', async () => {
    const generateJson = vi.fn().mockRejectedValue(new Error('Network error'));

    const planner = createPlanner(generateJson);
    const brief: RescueBrief = {
      commitment: 'Demo',
      deadline: new Date(Date.now() + 86400000).toISOString(),
      availableMinutes: 120,
      constraints: []
    };

    const plan = await planner.plan(brief);
    
    expect(plan.source).toBe('fallback');
  });
});
