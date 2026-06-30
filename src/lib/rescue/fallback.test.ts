import { describe, it, expect } from 'vitest';
import { createFallbackPlan, createFallbackRecovery } from './fallback';
import { RescueBrief, RescuePlan } from './contracts';

describe('Fallback', () => {
  describe('createFallbackPlan', () => {
    it('returns a valid fallback plan', () => {
      const brief: RescueBrief = {
        commitment: 'Important presentation',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        availableMinutes: 180,
        constraints: []
      };

      const plan = createFallbackPlan(brief);
      expect(plan.source).toBe('fallback');
      expect(plan.tasks.length).toBeGreaterThanOrEqual(4);
      expect(plan.tasks.length).toBeLessThanOrEqual(6);
      
      const hasAi = plan.tasks.some(t => t.lane === 'ai_execute');
      const hasHuman = plan.tasks.some(t => t.lane === 'human_work');
      expect(hasAi).toBe(true);
      expect(hasHuman).toBe(true);
      expect(plan.artifacts.length).toBeGreaterThan(0);
      
      // Totals logic
      const required = plan.tasks.filter(t => t.lane !== 'drop').reduce((s, t) => s + t.estimatedMinutes, 0);
      expect(plan.requiredMinutes).toBe(required);
    });
  });

  describe('createFallbackRecovery', () => {
    it('returns a recovery diff that does not increase available time', () => {
      const plan: RescuePlan = {
        id: 'plan-123',
        title: 'Emergency Rescue',
        deadline: new Date(Date.now() + 86400000).toISOString(),
        summary: 'A solid plan',
        requiredMinutes: 120,
        availableMinutes: 120,
        recoveredMinutes: 0,
        confidence: 100,
        riskExplanation: 'None',
        source: 'gemini',
        tasks: [
          { id: 't1', title: 'Task 1', lane: 'must_do', estimatedMinutes: 60, priority: 1, rationale: 'Needed', dependsOn: [] },
          { id: 't2', title: 'Task 2', lane: 'human_work', estimatedMinutes: 60, priority: 2, rationale: 'Needed', dependsOn: [] }
        ],
        artifacts: []
      };

      const diff = createFallbackRecovery(plan, 30);
      expect(diff.lostMinutes).toBe(30);
      expect(diff.changes.length).toBeGreaterThan(0);
      expect(diff.changes.every(c => c.rationale.length > 0)).toBe(true);
    });
  });
});
