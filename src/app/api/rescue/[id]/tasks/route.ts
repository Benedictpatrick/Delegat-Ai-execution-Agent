import { NextResponse } from 'next/server';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, lane = 'must_do', estimatedMinutes = 30 } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    const userId = await getDemoUserId();
    const supabase = getAdminClient() as any;

    const { data: commitment, error } = await supabase
      .from('commitments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !commitment) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const taskId = crypto.randomUUID();
    const meta = commitment.metadata || {};
    const existingTasks = meta.tasks || [];

    const newTask = {
      id: taskId,
      title: title.trim(),
      lane,
      estimatedMinutes,
      priority: 3,
      rationale: '',
      dependsOn: [],
    };

    meta.tasks = [...existingTasks, newTask];

    // Recalculate metrics
    const activeTasks = meta.tasks.filter((t: any) => t.lane !== 'drop');
    const droppedTasks = meta.tasks.filter((t: any) => t.lane === 'drop');
    meta.required_minutes = activeTasks.reduce((s: number, t: any) => s + (t.estimatedMinutes || 0), 0);
    meta.recovered_minutes = droppedTasks.reduce((s: number, t: any) => s + (t.estimatedMinutes || 0), 0);

    await supabase.from('commitments').update({ metadata: meta }).eq('id', id);

    // Also insert into tasks table
    const descJson = JSON.stringify({ lane, rationale: '', depends_on: [] });
    try {
      await supabase.from('tasks').insert({
        id: taskId,
        commitment_id: id,
        user_id: userId,
        title: title.trim(),
        description: descJson,
        type: 'research',
        execution_type: lane === 'ai_execute' ? 'auto_executable' : 'human_only',
        estimated_minutes: estimatedMinutes,
        sort_order: existingTasks.length + 1,
        status: lane === 'drop' ? 'cancelled' : 'pending',
      });
    } catch {
      // tasks table insert is best-effort; metadata is the source of truth
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
