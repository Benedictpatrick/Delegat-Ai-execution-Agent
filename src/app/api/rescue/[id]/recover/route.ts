import { NextResponse } from 'next/server';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';
import { createRecoveryAgent } from '@/lib/rescue/recovery';
import { logExecution } from '@/lib/rescue/repository';
import { generateText } from '@/lib/rescue/ai';

async function generateWithAI(prompt: string): Promise<unknown> {
  const { text } = await generateText(prompt, true);
  if (!text) throw new Error('Empty response from model');
  return JSON.parse(text);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const lostMinutes = body.lostMinutes || body.lost_minutes || 30;

    const userId = await getDemoUserId();
    const supabase = getAdminClient();

    // Reconstruct the plan
    const { data: commitment, error: commitErr } = await (supabase as any)
      .from('commitments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (commitErr || !commitment) {
      return NextResponse.json({ error: 'Rescue plan not found' }, { status: 404 });
    }

    const meta = commitment.metadata || {};

    let availableMinutes = meta.available_minutes ?? commitment.available_minutes;
    if (availableMinutes == null) {
      try { availableMinutes = JSON.parse(commitment.raw_input || '{}').availableMinutes ?? 0; } catch {}
    }

    const mappedCommitment = {
      ...commitment,
      type: 'rescue',
      available_minutes: availableMinutes,
      required_minutes: meta.required_minutes ?? commitment.required_minutes ?? 0,
      recovered_minutes: meta.recovered_minutes ?? commitment.recovered_minutes ?? 0,
      confidence_score: meta.confidence_score ?? commitment.confidence_score ?? 0,
      risk_explanation: meta.risk_explanation || commitment.risk_explanation,
      constraints: meta.constraints || commitment.constraints || [],
    };

    const { data: dbTasks } = await (supabase as any)
      .from('tasks')
      .select('*')
      .eq('commitment_id', id)
      .order('sort_order');

    const tasks = (dbTasks || []).map((t: any) => {
      try {
        const descObj = JSON.parse(t.description || '{}');
        return {
          ...t,
          lane: descObj.lane || t.lane || 'human_work',
          rationale: descObj.rationale || t.rationale || '',
          dependsOn: descObj.depends_on || t.depends_on || [],
        };
      } catch {
        return {
          ...t,
          lane: t.lane || 'human_work',
          rationale: t.rationale || '',
          dependsOn: t.depends_on || [],
        };
      }
    });

    const plan = {
      id: mappedCommitment.id,
      title: mappedCommitment.title,
      deadline: mappedCommitment.deadline,
      summary: '',
      requiredMinutes: mappedCommitment.required_minutes,
      availableMinutes: mappedCommitment.available_minutes,
      recoveredMinutes: mappedCommitment.recovered_minutes,
      confidence: mappedCommitment.confidence_score,
      riskExplanation: mappedCommitment.risk_explanation,
      source: 'gemini',
      tasks: tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        lane: t.lane,
        estimatedMinutes: t.estimated_minutes,
        priority: 5,
        rationale: t.rationale || '',
        dependsOn: t.dependsOn || []
      })),
      artifacts: meta.artifacts || []
    };

    const agent = createRecoveryAgent(generateWithAI);
    const recoveryResult = await agent.recover(plan as any, lostMinutes);

    // Apply changes in metadata
    meta.tasks = (meta.tasks || []).map((t: any) => {
      const change = recoveryResult.changes.find((c: any) => c.taskId === t.id);
      if (change) {
        return {
          ...t,
          lane: change.action === 'drop' ? 'drop' : t.lane,
          estimatedMinutes: change.revisedMinutes,
          rationale: change.rationale
        };
      }
      return t;
    });

    const newAvailable = Math.max(0, mappedCommitment.available_minutes - lostMinutes);
    const activeMins = meta.tasks
      .filter((t: any) => t.lane !== 'drop')
      .reduce((sum: number, t: any) => sum + (t.estimatedMinutes || 0), 0);
    const recoveredMins = meta.tasks
      .filter((t: any) => t.lane === 'drop')
      .reduce((sum: number, t: any) => sum + (t.estimatedMinutes || 0), 0);

    meta.available_minutes = newAvailable;
    meta.required_minutes = activeMins;
    meta.recovered_minutes = recoveredMins;
    meta.confidence_score = recoveryResult.revisedConfidence;

    await (supabase as any)
      .from('commitments')
      .update({ 
        confidence_score: recoveryResult.revisedConfidence,
        metadata: meta 
      })
      .eq('id', id);

    // Apply changes in tasks database table
    for (const change of recoveryResult.changes) {
      const { data: dbTask } = await (supabase as any)
        .from('tasks')
        .select('description')
        .eq('id', change.taskId)
        .single();
      
      let newDesc = dbTask?.description || '';
      try {
        const descObj = JSON.parse(newDesc || '{}');
        descObj.lane = change.action === 'drop' ? 'drop' : descObj.lane;
        descObj.rationale = change.rationale;
        newDesc = JSON.stringify(descObj);
      } catch {}

      const updatePayload: any = {
        status: change.action === 'drop' ? 'cancelled' : 'pending',
        estimated_minutes: change.revisedMinutes,
        description: newDesc
      };

      try {
        await (supabase as any)
          .from('tasks')
          .update({ ...updatePayload, lane: change.action === 'drop' ? 'drop' : 'human_work' })
          .eq('id', change.taskId);
      } catch {
        await (supabase as any)
          .from('tasks')
          .update(updatePayload)
          .eq('id', change.taskId);
      }
    }

    await logExecution(userId, id, 'recovery', 'recover', 'success', recoveryResult);

    return NextResponse.json({ success: true, recovery: recoveryResult });

  } catch (error: any) {
    console.error('Recovery API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
