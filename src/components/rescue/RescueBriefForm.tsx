'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

const INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: '1px solid rgba(0,0,0,0.12)', borderRadius: 11,
  padding: '11px 14px', fontSize: 15, color: '#1d1d1f',
  outline: 'none', fontFamily: FF,
  background: '#fff', letterSpacing: '-0.2px', lineHeight: 1.5,
};

const LABEL: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#1d1d1f',
  marginBottom: 7, display: 'block', letterSpacing: '-0.1px',
};

export function RescueBriefForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ commitment: '', deadline: '', availableMinutes: 120 });

  const fillDemo = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setForm({
      commitment: 'My research presentation is tomorrow. I have back-to-back meetings until 4 PM and nothing is prepared.',
      deadline: tomorrow.toISOString().slice(0, 16),
      availableMinutes: 180,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitment: form.commitment,
          deadline: form.deadline + ':00.000Z',
          availableMinutes: form.availableMinutes,
          constraints: [],
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to generate rescue plan');
      }
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: 580, margin: '72px auto 0',
      background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)',
      padding: '40px 40px 32px', fontFamily: FF,
    }}>
      <h2 style={{
        fontSize: 28, fontWeight: 600, color: '#1d1d1f',
        letterSpacing: '-0.374px', lineHeight: 1.1, marginBottom: 6,
      }}>
        New Rescue Brief
      </h2>
      <p style={{ fontSize: 15, color: '#6e6e73', marginBottom: 32, letterSpacing: '-0.2px' }}>
        Describe the crisis. Delegat builds a ruthless plan in seconds.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={LABEL}>The Situation</label>
          <textarea
            value={form.commitment}
            onChange={e => setForm(p => ({ ...p, commitment: e.target.value }))}
            required
            rows={4}
            placeholder="e.g. My research presentation is tomorrow. I have meetings until 4 PM and nothing prepared."
            style={{ ...INPUT, resize: 'vertical', minHeight: 110 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={LABEL}>Hard Deadline</label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
              required
              style={INPUT}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={LABEL}>Available Minutes</label>
            <input
              type="number"
              min="15"
              step="15"
              value={form.availableMinutes}
              onChange={e => setForm(p => ({ ...p, availableMinutes: parseInt(e.target.value) || 120 }))}
              required
              style={INPUT}
            />
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px', background: 'rgba(255,59,48,0.06)',
            color: '#ff3b30', borderRadius: 11, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 4,
        }}>
          <button
            type="button"
            onClick={fillDemo}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: '#6e6e73', fontFamily: FF, fontWeight: 500, letterSpacing: '-0.1px',
            }}
          >
            Load Demo Scenario
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !form.commitment}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0066cc', color: '#fff', fontSize: 15, fontWeight: 500,
              padding: '12px 24px', borderRadius: 9999, border: 'none',
              cursor: isSubmitting || !form.commitment ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !form.commitment ? 0.5 : 1,
              fontFamily: FF, letterSpacing: '-0.2px',
            }}
          >
            {isSubmitting ? (
              <><Loader2 size={15} className="animate-spin" /> Planning rescue...</>
            ) : (
              <><Sparkles size={15} /> Generate Plan</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
