import { NextResponse } from 'next/server';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await getDemoUserId();
    const supabase = getAdminClient();

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
    const mappedCommitment = {
      ...commitment,
      type: 'rescue',
      available_minutes: meta.available_minutes !== undefined ? meta.available_minutes : commitment.available_minutes,
      required_minutes: meta.required_minutes !== undefined ? meta.required_minutes : commitment.required_minutes,
      recovered_minutes: meta.recovered_minutes !== undefined ? meta.recovered_minutes : commitment.recovered_minutes,
      confidence_score: meta.confidence_score !== undefined ? meta.confidence_score : commitment.confidence_score,
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

    // Load artifacts from metadata (fallback)
    const artifacts = meta.artifacts || [];

    // Load executions from metadata
    const executions = meta.executions || [];

    return NextResponse.json({ 
      success: true, 
      workspace: {
        commitment: mappedCommitment,
        tasks: tasks || [],
        artifacts: artifacts || [],
        executions: executions || []
      }
    });
  } catch (error: any) {
    console.error('Workspace API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await getDemoUserId();
    const supabase = getAdminClient();

    // Soft delete by setting deleted_at
    const { error } = await (supabase as any)
      .from('commitments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
