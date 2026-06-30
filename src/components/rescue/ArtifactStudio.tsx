import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

export function ArtifactStudio({ artifacts, selectedId, onSelect, onGenerate, isGenerating }: {
  artifacts: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  const selected = artifacts.find(a => a.id === selectedId) || artifacts[0];
  
  const [streamedContent, setStreamedContent] = useState<string | null>(null);

  useEffect(() => {
    if (!isGenerating || !selectedId) {
      setStreamedContent(null);
      return;
    }

    const supabase = createClient();
    const channel = supabase.channel(`artifact_stream_${selectedId}`)
      .on('broadcast', { event: 'typing_chunk' }, (payload) => {
        setStreamedContent(payload.payload.text);
      })
      .on('broadcast', { event: 'typing_complete' }, (payload) => {
        setStreamedContent(payload.payload.text);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isGenerating, selectedId]);

  return (
    <div style={{
      background: '#fff', borderRadius: 18, border: '1px solid rgba(0,0,0,0.06)',
      fontFamily: FF, flex: 1, display: 'flex', flexDirection: 'column',
      minHeight: 300, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'stretch', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.06)', height: 46, paddingRight: 16,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '0 18px',
            fontSize: 13, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.1px',
            borderRight: '1px solid rgba(0,0,0,0.06)',
          }}>
            Artifact studio
          </div>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {artifacts.map(a => {
              const active = selected?.id === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => onSelect(a.id)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '0 16px',
                    fontSize: 13, fontWeight: 500,
                    color: active ? '#0066cc' : '#6e6e73',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: active ? '2px solid #0066cc' : '2px solid transparent',
                    letterSpacing: '-0.1px', fontFamily: FF,
                  }}
                >
                  {a.title}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating || !selected}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#0066cc', color: '#fff', fontSize: 12, fontWeight: 500,
            padding: '6px 14px', borderRadius: 9999, border: 'none',
            cursor: isGenerating || !selected ? 'not-allowed' : 'pointer',
            opacity: isGenerating || !selected ? 0.5 : 1,
            fontFamily: FF, letterSpacing: '-0.1px', alignSelf: 'center',
          }}
        >
          {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          Generate artifact
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{
          flex: 1, padding: 18,
          background: '#f5f5f7',
          fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
          fontSize: 12, color: '#1d1d1f', lineHeight: 1.65,
          overflowY: 'auto', borderRight: '1px solid rgba(0,0,0,0.06)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {streamedContent || selected?.content || 'No content generated yet. Click "Generate artifact" to begin.'}
          {isGenerating && (
            <span style={{ display: 'inline-block', width: 6, height: 14, background: '#0066cc', marginLeft: 4, verticalAlign: 'middle', animation: 'pulse 1s infinite' }} />
          )}
        </div>
        <div style={{ width: 200, padding: 18, background: '#fff', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', marginBottom: 8, letterSpacing: '-0.1px' }}>
            Notes
          </div>
          <p style={{ fontSize: 12, color: '#6e6e73', lineHeight: 1.55, marginBottom: 20 }}>
            AI drafted this {(selected?.title || '').toLowerCase()} from your situation. Edit freely.
          </p>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Last updated
            </div>
            <div style={{ fontSize: 12, color: '#6e6e73' }} suppressHydrationWarning>
              {selected?.updated_at
                ? new Date(selected.updated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                : 'Pending'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#1d1d1f', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Source
            </div>
            <div style={{ fontSize: 12, color: '#6e6e73' }}>Your situation + AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}
