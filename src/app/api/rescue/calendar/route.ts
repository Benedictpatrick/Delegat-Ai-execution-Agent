import { NextResponse } from 'next/server';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';
import { buildIcs } from '@/lib/rescue/calendar';
import { RescuePlan } from '@/lib/rescue/contracts';
import { logExecution } from '@/lib/rescue/repository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commitmentId = searchParams.get('commitmentId');

    if (!commitmentId) {
      return NextResponse.json({ error: 'Missing commitmentId' }, { status: 400 });
    }

    const userId = await getDemoUserId();
    const supabase = getAdminClient();

    const { data: tasks } = await (supabase as any)
      .from('tasks')
      .select('*')
      .eq('commitment_id', commitmentId)
      .order('sort_order');

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks found' }, { status: 404 });
    }

    const plan: RescuePlan = {
      id: commitmentId,
      title: 'Rescue Plan',
      deadline: new Date().toISOString(), // Mocked for builder
      summary: '',
      requiredMinutes: 0,
      availableMinutes: 0,
      recoveredMinutes: 0,
      confidence: 100,
      riskExplanation: '',
      source: 'gemini',
      tasks: tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        lane: t.lane as any,
        estimatedMinutes: t.estimated_minutes,
        priority: 5,
        rationale: t.rationale || '',
        dependsOn: t.depends_on || []
      })),
      artifacts: []
    };

    const icsContent = buildIcs(plan);

    await logExecution(userId, commitmentId, 'calendar', 'calendar_fallback', 'success', { tasks_exported: plan.tasks.length });

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="rescue_plan_' + commitmentId + '.ics"'
      }
    });

  } catch (error: any) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
