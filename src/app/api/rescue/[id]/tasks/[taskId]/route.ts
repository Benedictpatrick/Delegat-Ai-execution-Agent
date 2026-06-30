import { NextResponse } from 'next/server';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';

export async function PUT(request: Request, context: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const { id, taskId } = await context.params;
    const body = await request.json();
    const { lane } = body;

    if (!lane) {
      return NextResponse.json({ error: 'Lane is required' }, { status: 400 });
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

    const meta = commitment.metadata || {};
    const existingTasks = meta.tasks || [];

    // Find the task and update its lane
    let taskFound = false;
    meta.tasks = existingTasks.map((t: any) => {
      if (t.id === taskId) {
        taskFound = true;
        return { ...t, lane };
      }
      return t;
    });

    if (!taskFound) {
      return NextResponse.json({ error: 'Task not found in plan' }, { status: 404 });
    }

    // Recalculate metrics
    const activeTasks = meta.tasks.filter((t: any) => t.lane !== 'drop');
    const droppedTasks = meta.tasks.filter((t: any) => t.lane === 'drop');
    meta.required_minutes = activeTasks.reduce((s: number, t: any) => s + (t.estimatedMinutes || 0), 0);
    meta.recovered_minutes = droppedTasks.reduce((s: number, t: any) => s + (t.estimatedMinutes || 0), 0);

    // Update commitments table
    await supabase.from('commitments').update({ metadata: meta }).eq('id', id);

    // Also update tasks table (best effort sync)
    const { data: dbTask } = await supabase.from('tasks').select('description').eq('id', taskId).single();
    let newDesc = dbTask?.description || '';
    try {
      const descObj = JSON.parse(newDesc || '{}');
      descObj.lane = lane;
      newDesc = JSON.stringify(descObj);
    } catch {}

    const updatePayload: any = {
      description: newDesc,
      status: lane === 'drop' ? 'cancelled' : 'pending',
      execution_type: lane === 'ai_execute' ? 'auto_executable' : 'human_only',
    };

    try {
      await supabase.from('tasks').update(updatePayload).eq('id', taskId);
    } catch {
      // Best effort update
    }

    return NextResponse.json({ success: true, lane });
  } catch (error: any) {
    console.error('Update task API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
