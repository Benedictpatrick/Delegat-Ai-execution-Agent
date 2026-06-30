import React from 'react';
import { AlertTriangle } from 'lucide-react';

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

function fmtMins(mins: number) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export function PlanSummary({ commitment }: { commitment: any }) {
  const meta = commitment.metadata || {};
  const required   = commitment.required_minutes   ?? meta.required_minutes   ?? 0;
  const available  = commitment.available_minutes  ?? meta.available_minutes  ?? 0;
  const recovered  = commitment.recovered_minutes  ?? meta.recovered_minutes  ?? 0;
  const confidence = commitment.confidence_score   ?? meta.confidence_score   ?? 0;

  const stats = [
    { label: 'Required',   value: fmtMins(required)        },
    { label: 'Available',  value: fmtMins(available)       },
    { label: 'Recovered',  value: fmtMins(recovered), warn: recovered > 0 },
    { label: 'Confidence', value: confidence + '%'         },
  ];

  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)',
      padding: '22px 28px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', fontFamily: FF, gap: 24, flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 600, color: '#1d1d1f',
          letterSpacing: '-0.374px', lineHeight: 1.24, marginBottom: 7,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {commitment.title || 'Rescue Plan'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ff3b30', fontSize: 13, fontWeight: 500 }}>
          <AlertTriangle size={13} />
          <span suppressHydrationWarning>Deadline {fmtDate(commitment.deadline)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {stats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div style={{ width: 1, height: 36, background: 'rgba(0,0,0,0.07)', margin: '0 24px' }} />}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', color: '#aeaeb2', marginBottom: 5,
              }}>
                {s.label}
              </div>
              <div style={{
                fontSize: 22, fontWeight: 500, letterSpacing: '-0.374px', lineHeight: 1,
                color: s.warn ? '#f59e0b' : '#1d1d1f',
              }}>
                {s.value}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
