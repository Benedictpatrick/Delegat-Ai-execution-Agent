import { describe, it, expect } from 'vitest';
import { validateRescueBrief, validateRescuePlan } from './contracts';

describe('Rescue Contracts', () => {
  describe('validateRescueBrief', () => {
    it('accepts a valid brief', () => {
      const result = validateRescueBrief({
        commitment: 'Finish the presentation',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        availableMinutes: 120,
        constraints: ['Must look professional']
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty commitments', () => {
      const result = validateRescueBrief({
        commitment: '   ',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        availableMinutes: 120,
        constraints: []
      });
      expect(result.success).toBe(false);
    });

    it('rejects past deadlines', () => {
      const result = validateRescueBrief({
        commitment: 'Finish the presentation',
        deadline: new Date(Date.now() - 86400000).toISOString(),
        availableMinutes: 120,
        constraints: []
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-positive availability', () => {
      const result = validateRescueBrief({
        commitment: 'Finish the presentation',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        availableMinutes: 0,
        constraints: []
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateRescuePlan', () => {
    it('accepts a complete canonical payload', () => {
      const result = validateRescuePlan({
        id: 'plan-123',
        title: 'Emergency Rescue',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        summary: 'A solid plan',
        requiredMinutes: 60,
        availableMinutes: 120,
        recoveredMinutes: 0,
        confidence: 100,
        riskExplanation: 'None',
        source: 'gemini',
        tasks: [
          {
            id: 'task-1',
            title: 'Do the thing',
            lane: 'ai_execute',
            estimatedMinutes: 30,
            priority: 1,
            rationale: 'Needed',
            dependsOn: []
          }
        ],
        artifacts: [
          {
            id: 'art-1',
            taskId: 'task-1',
            type: 'outline',
            title: 'Outline',
            instructions: 'Make it good'
          }
        ]
      });
      expect(result.success).toBe(true);
    });

    it('rejects unknown classifications', () => {
      const result = validateRescuePlan({
        id: 'plan-123',
        title: 'Emergency Rescue',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        summary: 'A solid plan',
        requiredMinutes: 60,
        availableMinutes: 120,
        recoveredMinutes: 0,
        confidence: 100,
        riskExplanation: 'None',
        source: 'gemini',
        tasks: [
          {
            id: 'task-1',
            title: 'Do the thing',
            lane: 'unknown_lane' as any,
            estimatedMinutes: 30,
            priority: 1,
            rationale: 'Needed',
            dependsOn: []
          }
        ],
        artifacts: []
      });
      expect(result.success).toBe(false);
    });

    it('rejects duplicate task IDs', () => {
      const result = validateRescuePlan({
        id: 'plan-123',
        title: 'Emergency Rescue',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        summary: 'A solid plan',
        requiredMinutes: 60,
        availableMinutes: 120,
        recoveredMinutes: 0,
        confidence: 100,
        riskExplanation: 'None',
        source: 'gemini',
        tasks: [
          { id: 't1', title: 'A', lane: 'must_do', estimatedMinutes: 10, priority: 1, rationale: 'R', dependsOn: [] },
          { id: 't1', title: 'B', lane: 'must_do', estimatedMinutes: 10, priority: 2, rationale: 'R', dependsOn: [] }
        ],
        artifacts: []
      });
      expect(result.success).toBe(false);
    });

    it('rejects artifact requests without source tasks', () => {
      const result = validateRescuePlan({
        id: 'plan-123',
        title: 'Emergency Rescue',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        summary: 'A solid plan',
        requiredMinutes: 60,
        availableMinutes: 120,
        recoveredMinutes: 0,
        confidence: 100,
        riskExplanation: 'None',
        source: 'gemini',
        tasks: [],
        artifacts: [
          {
            id: 'a1',
            taskId: 'missing-task-id',
            type: 'brief',
            title: 'B',
            instructions: 'I'
          }
        ]
      });
      expect(result.success).toBe(false);
    });
  });
});
