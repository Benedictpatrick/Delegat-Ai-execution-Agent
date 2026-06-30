import { describe, it, expect, vi } from 'vitest';
import { createMaker } from './maker';

describe('Maker', () => {
  it('generates content successfully', async () => {
    const generateMarkdown = vi.fn().mockResolvedValue('# Hello World');
    const maker = createMaker(generateMarkdown);
    
    const content = await maker.generateArtifact('draft_email', 'Write an email');
    expect(content).toBe('# Hello World');
  });

  it('falls back when the model fails', async () => {
    const generateMarkdown = vi.fn().mockRejectedValue(new Error('timeout'));
    const maker = createMaker(generateMarkdown);
    
    const content = await maker.generateArtifact('draft_email', 'Write an email');
    expect(content).toContain('Fallback generated artifact');
  });
});
