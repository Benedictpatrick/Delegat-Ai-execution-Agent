'use client';
import React, { useState } from 'react';
import { AlertCircle, Sparkles, User, Trash2, Plus, Loader2, Check, X } from 'lucide-react';

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

const LANES = [
  { id: 'must_do', label: 'Must do', Icon: AlertCircle, accent: '#ff3b30' },
  { id: 'ai_execute', label: 'AI executes', Icon: Sparkles, accent: '#0066cc' },
  { id: 'human_work', label: 'Human work', Icon: User, accent: '#3c3c43' },
  { id: 'drop', label: 'Drop', Icon: Trash2, accent: '#aeaeb2' },
];

function fmtMins(mins: number) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function AddTaskRow({ commitmentId, lane, onDone }: { commitmentId: string; lane: string; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/rescue/${commitmentId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, lane, estimatedMinutes: minutes }),
      });
      onDone();
    } finally { setSaving(false); }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 8px',
      background: 'rgba(0,102,204,0.05)', borderRadius: 8,
      border: '1px solid rgba(0,102,204,0.15)', marginTop: 4,
    }}>
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onDone(); }}
        placeholder="Task title..."
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          fontSize: 13, color: '#1d1d1f', fontFamily: FF, minWidth: 0,
        }}
      />
      <input
        type="number"
        value={minutes}
        onChange={e => setMinutes(Number(e.target.value))}
        min={5} step={5}
        style={{
          width: 36, textAlign: 'center', background: 'transparent', border: 'none',
          outline: 'none', fontSize: 12, color: '#6e6e73', fontFamily: FF,
          borderLeft: '1px solid rgba(0,0,0,0.08)', paddingLeft: 6,
        }}
      />
      <span style={{ fontSize: 11, color: '#6e6e73' }}>m</span>
      <button
        onClick={save}
        disabled={saving || !title.trim()}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#0066cc',
          padding: 2, opacity: (!title.trim() || saving) ? 0.4 : 1,
        }}
      >
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      </button>
      <button
        onClick={onDone}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6e6e73', padding: 2 }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function RescueBoard({ tasks, commitmentId, onRefresh }: {
  tasks: any[]; commitmentId: string; onRefresh: () => void;
}) {
  const [addingLane, setAddingLane] = useState<string | null>(null);
  const [movingTask, setMovingTask] = useState<string | null>(null);

  const handleDrop = async (e: React.DragEvent | any, laneId: string, explicitTaskId?: string) => {
    e.preventDefault();
    const taskId = explicitTaskId || e.dataTransfer?.getData('taskId');
    if (!taskId) return;
    
    // Prevent redundant updates
    const task = tasks.find(t => t.id === taskId);
    if (task && task.lane === laneId) return;

    setMovingTask(taskId);
    try {
      const res = await fetch(`/api/rescue/${commitmentId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lane: laneId })
      });
      if (res.ok) onRefresh();
      else { const err = await res.json().catch(()=>({})); alert('Failed to move task: ' + (err.error || res.statusText)); }
    } catch (err: any) {
      console.error('Failed to move task:', err);
      alert('Error moving task');
    } finally {
      setMovingTask(null);
    }
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)',
      fontFamily: FF, overflow: 'hidden',
    }}>
      <div style={{
        padding: '13px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)',
        fontSize: 13, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.1px',
      }}>
        Rescue board
      </div>
      <div style={{ display: 'flex', overflowX: 'auto' }}>
        {LANES.map((lane, lIdx) => {
          const laneTasks = tasks.filter(t => t.lane === lane.id);
          const totalMins = laneTasks.reduce((s, t) => s + (t.estimated_minutes ?? t.estimatedMinutes ?? 0), 0);

          return (
            <div key={lane.id} style={{
              flex: 1, minWidth: 240, padding: '16px 18px',
              borderLeft: lIdx > 0 ? '1px solid rgba(0,0,0,0.06)' : undefined,
              display: 'flex', flexDirection: 'column',
              transition: 'background 0.2s',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, lane.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <lane.Icon size={13} style={{ color: lane.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.1px', flex: 1 }}>
                  {lane.label}
                </span>
                <span style={{ fontSize: 11, color: '#6e6e73', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtMins(totalMins)}
                </span>
              </div>

              <div style={{ display: 'flex', paddingBottom: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: 8, gap: 4 }}>
                <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: '#aeaeb2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Task</span>
                <span style={{ width: 36, textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#aeaeb2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dur</span>
                <span style={{ width: 72, textAlign: 'right', fontSize: 10, fontWeight: 600, color: '#aeaeb2', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rationale</span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {laneTasks.map(t => (
                  <div key={t.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('taskId', t.id)}
                    style={{ 
                      display: 'flex', alignItems: 'flex-start', padding: '7px 5px', borderRadius: 7, gap: 4, cursor: 'grab',
                      opacity: movingTask === t.id ? 0.5 : 1, position: 'relative'
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = '#f5f5f7')}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
                  >
                    <select
                      value={t.lane}
                      onChange={(e) => handleDrop({ preventDefault: () => {} } as any, e.target.value, t.id)}
                      style={{
                        position: 'absolute', opacity: 0, left: 0, top: 0, width: '100%', height: '100%', cursor: 'pointer'
                      }}
                      title="Move task"
                    >
                      {LANES.map(l => <option key={l.id} value={l.id}>Move to {l.label}</option>)}
                    </select>
                    <span style={{
                      flex: 1, fontSize: 13, fontWeight: 500, color: '#1d1d1f', letterSpacing: '-0.1px',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', pointerEvents: 'none'
                    }}>{t.title}</span>
                    <span style={{ width: 36, textAlign: 'center', fontSize: 12, color: '#6e6e73', flexShrink: 0 }}>
                      {t.estimated_minutes ?? t.estimatedMinutes ?? 0}m
                    </span>
                    <span style={{
                      width: 72, textAlign: 'right', fontSize: 11, color: '#aeaeb2',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{t.rationale}</span>
                  </div>
                ))}

                {addingLane === lane.id && (
                  <AddTaskRow
                    commitmentId={commitmentId}
                    lane={lane.id}
                    onDone={() => { setAddingLane(null); onRefresh(); }}
                  />
                )}
              </div>

              <button
                onClick={() => setAddingLane(lane.id)}
                style={{
                  marginTop: 10, display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 13, fontWeight: 500, color: '#0066cc',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 0', fontFamily: FF, letterSpacing: '-0.1px',
                }}
              >
                <Plus size={13} /> Add task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
