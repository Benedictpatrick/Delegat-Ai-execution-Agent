import { GoogleGenAI } from '@google/genai';

export type AISource = 'groq' | 'gemini'

export async function generateText(prompt: string, forceJson = false): Promise<{ text: string; source: AISource }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (groqKey) {
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    console.log(`Using Groq (${model}) for generation...`);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: forceJson ? { type: 'json_object' } : undefined,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error: ${err}`);
    }

    const data = await response.json();
    return { text: data.choices?.[0]?.message?.content || '', source: 'groq' };
  }

  if (geminiKey) {
    console.log('Using Gemini for generation...');
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: forceJson ? {
        temperature: 0.2,
        responseMimeType: 'application/json'
      } : {
        temperature: 0.2
      }
    });

    return { text: response.text || '', source: 'gemini' };
  }

  throw new Error('No API key configured (GEMINI_API_KEY or GROQ_API_KEY)');
}
