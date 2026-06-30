import { describe, it, expect, vi } from 'vitest';
import { createRecoveryAgent } from './recovery';
import { RescuePlan } from './contracts';

describe('Recovery Agent', () => {
  it('generates recovery plan successfully', async () => {
    const generateJson = vi.fn().mockResolvedValue({
      lostMinutes: 30,
      explanation: 'Dropping task 2 to recover time',
      revisedConfidence: 90,
      changes: [
        { taskId: 't2', action: 'drop', previousMinutes: 30, revisedMinutes: 0, rationale: 'Out of time' }
      ]
    });

    const agent = createRecoveryAgent(generateJson);
    const plan: RescuePlan = {
      id: 'p1',
      title: 'Plan 1',
      deadline: new Date().toISOString(),
      summary: '',
      requiredMinutes: 60,
      availableMinutes: 120,
      recoveredMinutes: 0,
      confidence: 100,
      riskExplanation: '',
      source: 'gemini',
      artifacts: [],
      tasks: [
        { id: 't1', title: 'Task 1', lane: 'must_do', estimatedMinutes: 30, priority: 5, rationale: '', dependsOn: [] },
        { id: 't2', title: 'Task 2', lane: 'human_work', estimatedMinutes: 30, priority: 3, rationale: '', dependsOn: [] }
      ]
    };

    const recovery = await agent.recover(plan, 30);
    expect(recovery.changes.length).toBe(1);
    expect(recovery.changes[0].taskId).toBe('t2');
  });

  it('falls back on timeout', async () => {
    const generateJson = vi.fn().mockRejectedValue(new Error('timeout'));
    const agent = createRecoveryAgent(generateJson);
    const plan: RescuePlan = {
      id: 'p1',
      title: 'Plan 1',
      deadline: new Date().toISOString(),
      summary: '',
      requiredMinutes: 60,
      availableMinutes: 120,
      recoveredMinutes: 0,
      confidence: 100,
      riskExplanation: '',
      source: 'gemini',
      artifacts: [],
      tasks: [
        { id: 't1', title: 'Task 1', lane: 'must_do', estimatedMinutes: 30, priority: 5, rationale: '', dependsOn: [] },
        { id: 't2', title: 'Task 2', lane: 'human_work', estimatedMinutes: 30, priority: 3, rationale: '', dependsOn: [] }
      ]
    };

    const recovery = await agent.recover(plan, 30);
    expect(recovery.explanation).toContain('ruthlessly dropping');
  });
});
