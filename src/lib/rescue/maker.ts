export type GenerateMarkdown = (type: string, instructions: string) => Promise<string>;

export function createMaker(generateMarkdown: GenerateMarkdown) {
  return {
    async generateArtifact(type: string, instructions: string): Promise<string> {
      try {
        return await generateMarkdown(type, instructions);
      } catch (error) {
        console.error('Maker fallback triggered:', error);
        return `# ${type.toUpperCase()}\n\n*Fallback generated artifact due to AI timeout.*\n\nInstructions were: ${instructions}`;
      }
    }
  };
}
