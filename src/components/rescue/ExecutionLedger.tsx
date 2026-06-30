import React from 'react';

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

const COLS = ['Time', 'Item', 'Owner', 'Status', 'Details'] as const;

function fmtTime(d: string) {
  return new Date(d).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function ExecutionLedger({ executions }: { executions: any[] }) {
  const rows = executions.slice(0, 8);

  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)',
      fontFamily: FF, overflow: 'hidden',
    }}>
      <div style={{
        padding: '13px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)',
        fontSize: 13, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.1px',
      }}>
        Execution ledger
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {COLS.map(h => (
              <th key={h} style={{
                padding: '8px 16px', textAlign: 'left',
                fontSize: 10, fontWeight: 600, color: '#aeaeb2',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: '#f5f5f7', borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <tr
              key={e.id}
              style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.04)' : undefined }}
              onMouseEnter={ev => ((ev.currentTarget as HTMLTableRowElement).style.background = '#f5f5f7')}
              onMouseLeave={ev => ((ev.currentTarget as HTMLTableRowElement).style.background = 'transparent')}
            >
              <td style={{ padding: '10px 16px', color: '#6e6e73', whiteSpace: 'nowrap' }} suppressHydrationWarning>
                {fmtTime(e.created_at)}
              </td>
              <td style={{ padding: '10px 16px', fontWeight: 500, color: '#1d1d1f' }}>
                {e.action_type}
              </td>
              <td style={{ padding: '10px 16px', color: '#6e6e73' }}>
                {e.agent || 'system'}
              </td>
              <td style={{ padding: '10px 16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: e.status === 'success' ? '#30d158' : '#0066cc',
                  }} />
                  <span style={{
                    fontSize: 12,
                    color: e.status === 'success' ? '#30d158' : '#0066cc',
                  }}>
                    {e.status}
                  </span>
                </span>
              </td>
              <td style={{
                padding: '10px 16px', color: '#6e6e73', fontSize: 12,
                maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {typeof e.output_data === 'object' ? JSON.stringify(e.output_data) : String(e.output_data || '')}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '28px 16px', textAlign: 'center', color: '#aeaeb2', fontSize: 13 }}>
                No executions recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
