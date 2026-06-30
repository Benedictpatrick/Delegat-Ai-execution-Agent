import { RescuePlan } from './contracts';

export function buildIcs(plan: RescuePlan): string {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Delegat//Deadline Rescue//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\\r\\n') + '\\r\\n';

  let currentStart = new Date();
  
  plan.tasks
    .filter(t => t.lane === 'human_work' || t.lane === 'must_do')
    .forEach(task => {
      const start = new Date(currentStart);
      const end = new Date(currentStart.getTime() + task.estimatedMinutes * 60000);
      
      ics += [
        'BEGIN:VEVENT',
        `UID:${task.id}@delegat.app`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        `SUMMARY:${task.title}`,
        `DESCRIPTION:${task.rationale}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';

      currentStart = end;
    });

  ics += 'END:VCALENDAR\\r\\n';
  return ics;
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
