import { describe, it, expect } from 'vitest';
import { calculateConfidence, sumActiveMinutes, sumRecoveredMinutes } from './scoring';
import { RescueTask } from './contracts';

describe('Scoring', () => {
  describe('calculateConfidence', () => {
    it('returns 40 when required=360, available=180, riskPenalty=10', () => {
      expect(calculateConfidence({ requiredMinutes: 360, availableMinutes: 180, completedMinutes: 0, riskPenalty: 10 })).toBe(40);
    });

    it('returns 100 when required=180, available=240, riskPenalty=0', () => {
      expect(calculateConfidence({ requiredMinutes: 180, availableMinutes: 240, completedMinutes: 0, riskPenalty: 0 })).toBe(100);
    });

    it('returns 100 when required=0, available=60', () => {
      expect(calculateConfidence({ requiredMinutes: 0, availableMinutes: 60, completedMinutes: 0, riskPenalty: 0 })).toBe(100);
    });
    
    it('clamps to minimum 5', () => {
      expect(calculateConfidence({ requiredMinutes: 600, availableMinutes: 10, completedMinutes: 0, riskPenalty: 10 })).toBe(5);
    });
  });

  describe('sumActiveMinutes', () => {
    it('sums only active tasks', () => {
      const tasks: Partial<RescueTask>[] = [
        { lane: 'must_do', estimatedMinutes: 30 },
        { lane: 'ai_execute', estimatedMinutes: 10 },
        { lane: 'drop', estimatedMinutes: 60 }
      ];
      expect(sumActiveMinutes(tasks as RescueTask[])).toBe(40);
    });
  });

  describe('sumRecoveredMinutes', () => {
    it('sums only dropped tasks', () => {
      const tasks: Partial<RescueTask>[] = [
        { lane: 'must_do', estimatedMinutes: 30 },
        { lane: 'drop', estimatedMinutes: 45 },
        { lane: 'drop', estimatedMinutes: 15 }
      ];
      expect(sumRecoveredMinutes(tasks as RescueTask[])).toBe(60);
    });
  });
});
