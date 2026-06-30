import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/encryption';
import { getDemoUserId } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

function createIcs(tasks: any[], deadline: string) {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Delegat//Deadline Rescue//EN',
    'CALSCALE:GREGORIAN'
  ].join('\r\n') + '\r\n';

  let currentTime = new Date(); // Start scheduling from now for the demo

  for (const task of tasks) {
    if (task.classification === 'drop') continue;

    const startTime = new Date(currentTime);
    const endTime = new Date(startTime.getTime() + task.estimated_minutes * 60000);
    
    // Format dates for ICS: YYYYMMDDThhmmssZ
    const formatIcsDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    ics += [
      'BEGIN:VEVENT',
      'DTSTAMP:' + formatIcsDate(new Date()),
      'DTSTART:' + formatIcsDate(startTime),
      'DTEND:' + formatIcsDate(endTime),
      'SUMMARY:' + task.title,
      'DESCRIPTION:Delegat Task: ' + task.classification,
      'END:VEVENT'
    ].join('\r\n') + '\r\n';

    currentTime = endTime;
  }

  ics += 'END:VCALENDAR\r\n';
  return ics;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Auth - Use Demo User
    const demoUserId = await getDemoUserId();
    if (!demoUserId) return NextResponse.json({ error: 'Demo user not found' }, { status: 404 });

    const body = await request.json();
    const { commitmentId } = body;

    if (!commitmentId) {
      return NextResponse.json({ error: 'commitmentId is required' }, { status: 400 });
    }

    const { data: commitment } = await supabase.from('commitments').select('*').eq('id', commitmentId).single();
    if (!commitment) return NextResponse.json({ error: 'Commitment not found' }, { status: 404 });

    const { data: dbTasks } = await (supabase as any).from('tasks').select('*').eq('commitment_id', commitmentId).order('sort_order');
    if (!dbTasks || dbTasks.length === 0) return NextResponse.json({ error: 'No tasks found' }, { status: 404 });

    const tasks = dbTasks.map((t: any) => {
      try {
        const descObj = JSON.parse(t.description || '{}');
        return {
          ...t,
          classification: descObj.lane || t.classification || 'human_work'
        };
      } catch {
        return {
          ...t,
          classification: t.classification || 'human_work'
        };
      }
    });

    const { data: tokenRecord } = await (supabase as any)
      .from('google_tokens')
      .select('*')
      .eq('user_id', demoUserId)
      .eq('connection_status', 'connected')
      .single();

    if (tokenRecord && tokenRecord.access_token_encrypted) {
      try {
        const accessToken = decrypt(tokenRecord.access_token_encrypted);
        
        let currentTime = new Date();
        const createdEvents = [];

        for (const task of tasks) {
          if (task.classification === 'drop') continue;

          const startTime = new Date(currentTime);
          const endTime = new Date(startTime.getTime() + task.estimated_minutes * 60000);

          const event = {
            summary: task.title,
            description: 'Delegat Task: ' + task.classification,
            start: { dateTime: startTime.toISOString() },
            end: { dateTime: endTime.toISOString() }
          };

          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + accessToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event)
          });

          if (res.ok) {
            const data = await res.json();
            createdEvents.push(data);
            
            // Update task with calendar id
            await (supabase as any).from('tasks').update({ 
              scheduled_start: startTime.toISOString(),
              scheduled_end: endTime.toISOString(),
              google_calendar_event_id: data.id 
            }).eq('id', task.id);
          } else {
            console.error('Failed to create event:', await res.text());
          }

          currentTime = endTime;
        }

        // Create execution record
        await (supabase as any).from('executions').insert({
          user_id: demoUserId,
          commitment_id: commitmentId,
          agent: 'maker',
          action_type: 'calendar_book',
          status: 'success',
          input_data: { type: 'google_calendar' },
          output_data: { events_created: createdEvents.length } as any,
        });

        return NextResponse.json({ success: true, adapter: 'google' });
      } catch (err) {
        console.error("Google Calendar Error, falling back to ICS:", err);
        // Fallthrough to ICS on error
      }
    }

    // Fallback to ICS
    const icsContent = createIcs(tasks, commitment.deadline || new Date().toISOString());

    // Update tasks scheduling (mocking local schedule)
    let currentTime = new Date();
    for (const task of tasks) {
        if (task.classification === 'drop') continue;
        const startTime = new Date(currentTime);
        const endTime = new Date(startTime.getTime() + task.estimated_minutes * 60000);
        await (supabase as any).from('tasks').update({ 
            scheduled_start: startTime.toISOString(),
            scheduled_end: endTime.toISOString(),
          }).eq('id', task.id);
        currentTime = endTime;
    }

    await (supabase as any).from('executions').insert({
      user_id: demoUserId,
      commitment_id: commitmentId,
      agent: 'maker',
      action_type: 'calendar_book',
      status: 'success',
      input_data: { type: 'ics' },
      output_data: { events_created: tasks.length } as any,
    });

    return NextResponse.json({ success: true, adapter: 'ics', ics: icsContent });

  } catch (error: any) {
    console.error('Events API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
