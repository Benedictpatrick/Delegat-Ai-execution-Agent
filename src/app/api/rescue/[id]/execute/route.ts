import { NextResponse } from 'next/server';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { decryptToken } from '@/lib/calendar/crypto';
import { createGoogleCalendarEvent } from '@/lib/calendar/google';
import { logExecution } from '@/lib/rescue/repository';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await getDemoUserId();
    const supabase = getAdminClient();

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('calendar_token');
    
    if (!tokenCookie?.value) {
      return NextResponse.json({ error: 'Not connected to Google Calendar' }, { status: 401 });
    }

    const accessToken = decryptToken(tokenCookie.value);

    // Fetch tasks
    const { data: tasks, error } = await (supabase as any)
      .from('tasks')
      .select('*')
      .eq('commitment_id', id)
      .in('lane', ['must_do', 'human_work'])
      .order('sort_order');

    if (error || !tasks) {
      return NextResponse.json({ error: 'Tasks not found' }, { status: 404 });
    }

    let currentStart = new Date();
    let eventsCreated = 0;

    for (const task of tasks) {
      const start = new Date(currentStart);
      const end = new Date(currentStart.getTime() + task.estimated_minutes * 60000);

      const gcalEvent = await createGoogleCalendarEvent(accessToken, {
        summary: task.title,
        description: task.rationale || 'Delegat Rescue Task',
        start,
        end
      });

      await (supabase as any)
        .from('tasks')
        .update({ google_calendar_event_id: gcalEvent.id })
        .eq('id', task.id);

      currentStart = end;
      eventsCreated++;
    }

    await logExecution(userId, id, 'calendar', 'calendar_create', 'success', { eventsCreated });

    return NextResponse.json({ success: true, eventsCreated });

  } catch (error: any) {
    console.error('Calendar execute API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
