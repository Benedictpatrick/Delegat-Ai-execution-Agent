import { NextResponse } from 'next/server';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';
import { createMaker } from '@/lib/rescue/maker';
import { logExecution } from '@/lib/rescue/repository';
import { generateText } from '@/lib/rescue/ai';

async function generateWithAI(type: string, instructions: string): Promise<string> {
  const prompt = `You are the Delegat Maker Agent. Generate the requested artifact.
Type: ${type}
Instructions: ${instructions}

Return markdown formatting only.`;

  return (await generateText(prompt, false)).text;
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await getDemoUserId();
    const supabase = getAdminClient();

    let artifact: any = null;
    let commitment: any = null;

    // 1. Try querying artifacts table
    const { data: dbArtifact } = await (supabase as any)
      .from('artifacts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (dbArtifact) {
      artifact = dbArtifact;
    } else {
      // Fallback: search in commitments metadata
      const { data: commitments } = await (supabase as any)
        .from('commitments')
        .select('*')
        .eq('user_id', userId);

      for (const c of commitments || []) {
        const found = c.metadata?.artifacts?.find((a: any) => a.id === id);
        if (found) {
          artifact = found;
          commitment = c;
          break;
        }
      }
    }

    if (!artifact) {
      return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
    }

    // Add Google Search grounding if this is a research artifact
    const configTools: any[] = [];
    if (artifact.type === 'research' || artifact.title?.toLowerCase().includes('research')) {
      configTools.push({ googleSearch: {} });
    }

    const ai = new (require('@google/genai').GoogleGenAI)({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are the Delegat Maker Agent. Generate the requested artifact.
Type: ${artifact.type}
Instructions: ${artifact.instructions || artifact.title}

Return markdown formatting only.`;

    const streamChannel = (supabase as any).channel(`artifact_stream_${id}`);
    
    let content = '';
    try {
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.4,
          tools: configTools.length > 0 ? configTools : undefined,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          content += chunk.text;
          await streamChannel.send({
            type: 'broadcast',
            event: 'typing_chunk',
            payload: { text: content }
          });
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      content = 'Error generating artifact.';
    } finally {
      await streamChannel.send({ type: 'broadcast', event: 'typing_complete', payload: { text: content } });
      await (supabase as any).removeChannel(streamChannel);
    }
    if (dbArtifact) {
      try {
        await (supabase as any)
          .from('artifacts')
          .update({ content, status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.log('Failed updating artifacts table:', err);
      }
    }

    // Also update in commitment metadata
    if (commitment || !dbArtifact) {
      if (!commitment) {
        const { data: c } = await (supabase as any)
          .from('commitments')
          .select('*')
          .eq('id', artifact.commitment_id || artifact.commitmentId)
          .single();
        commitment = c;
      }

      if (commitment) {
        const meta = commitment.metadata || {};
        const artifacts = (meta.artifacts || []).map((a: any) => {
          if (a.id === id) {
            return { ...a, content, status: 'completed', updated_at: new Date().toISOString() };
          }
          return a;
        });

        await (supabase as any)
          .from('commitments')
          .update({ metadata: { ...meta, artifacts } })
          .eq('id', commitment.id);
      }
    }

    await logExecution(userId, artifact.commitment_id || artifact.commitmentId, 'maker', 'generate_artifact', 'success', { artifact_id: id });

    return NextResponse.json({ success: true, content });

  } catch (error: any) {
    console.error('Maker API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
