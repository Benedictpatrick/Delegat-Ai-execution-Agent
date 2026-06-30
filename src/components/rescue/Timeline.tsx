import React from 'react';
import { Sparkles, User } from 'lucide-react';

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

function fmtTime(d: Date) {
  return d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function fmtDeadline(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export function Timeline({ tasks, deadline }: { tasks: any[]; deadline: string }) {
  const activeTasks = tasks.filter(t => t.lane !== 'drop');

  const slots: { task: any; startLabel: string }[] = [];
  let cursor = new Date();
  for (const t of activeTasks) {
    slots.push({ task: t, startLabel: slots.length === 0 ? 'Now' : fmtTime(cursor) });
    cursor = new Date(cursor.getTime() + (t.estimated_minutes ?? t.estimatedMinutes ?? 0) * 60000);
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)',
      fontFamily: FF, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}>
      <div style={{
        padding: '13px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)',
        fontSize: 13, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.1px', flexShrink: 0,
      }}>
        Schedule
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>

        {slots.map(({ task: t, startLabel }, i) => {
          const isAI = t.lane === 'ai_execute';
          const isLast = i === slots.length - 1;

          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 0 }}>
              {/* Time column */}
              <div
                suppressHydrationWarning
                style={{
                  width: 56, flexShrink: 0, paddingRight: 8, paddingTop: 3,
                  textAlign: 'right', fontSize: 11, color: '#6e6e73',
                  lineHeight: '15px', fontVariantNumeric: 'tabular-nums',
                }}
              >
                {startLabel}
              </div>

              {/* Dot + line column */}
              <div style={{ width: 16, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                  background: isAI ? '#0066cc' : '#d1d1d6',
                  border: '2px solid #fff',
                  boxShadow: `0 0 0 1px ${isAI ? '#0066cc' : '#d1d1d6'}`,
                  zIndex: 1,
                }} />
                {!isLast && (
                  <div style={{ width: 1, flex: 1, minHeight: 28, background: 'rgba(0,0,0,0.08)', marginTop: 2 }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingLeft: 8, paddingBottom: isLast ? 0 : 20, paddingTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {isAI && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#0066cc', letterSpacing: '-0.1px' }}>AI  </span>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f', letterSpacing: '-0.1px' }}>
                      {t.title}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#6e6e73', flexShrink: 0 }}>
                    {t.estimated_minutes ?? t.estimatedMinutes ?? 0}m
                  </span>
                  {isAI
                    ? <Sparkles size={12} style={{ color: '#0066cc', flexShrink: 0, marginTop: 2 }} />
                    : <User size={12} style={{ color: '#aeaeb2', flexShrink: 0, marginTop: 2 }} />
                  }
                </div>
              </div>
            </div>
          );
        })}

        {activeTasks.length === 0 && (
          <div style={{ color: '#aeaeb2', fontSize: 13, textAlign: 'center', paddingTop: 24 }}>
            No active tasks.
          </div>
        )}

        {/* Deadline row */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
          <div style={{ width: 56, flexShrink: 0 }} />
          <div style={{ width: 16, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#ff3b30', border: '2px solid #fff', boxShadow: '0 0 0 1px #ff3b30',
            }} />
          </div>
          <div style={{ flex: 1, paddingLeft: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: '#ff3b30' }} suppressHydrationWarning>
              Deadline · {fmtDeadline(deadline)}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 24, paddingLeft: 72, fontSize: 11, color: '#aeaeb2' }}>
          Times in your time zone
        </div>
      </div>
    </div>
  );
}
