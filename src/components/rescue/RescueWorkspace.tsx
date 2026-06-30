'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RescueBriefForm } from './RescueBriefForm';
import { PlanSummary } from './PlanSummary';
import { RescueBoard } from './RescueBoard';
import { Timeline } from './Timeline';
import { ArtifactStudio } from './ArtifactStudio';
import { ExecutionLedger } from './ExecutionLedger';
import { Target, Calendar as CalendarIcon, Clock, Loader2, Trash2, Link2 } from 'lucide-react';

const FF = "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif";

function DelogatHex() {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
      <path d="M14,14 L4.5,8.5 L14,3Z"      fill="#4285F4"/>
      <path d="M14,14 L14,3 L23.5,8.5Z"      fill="#EA4335"/>
      <path d="M14,14 L23.5,8.5 L23.5,19.5Z" fill="#FBBC05"/>
      <path d="M14,14 L23.5,19.5 L14,25Z"    fill="#34A853"/>
      <path d="M14,14 L14,25 L4.5,19.5Z"     fill="#34A853"/>
      <path d="M14,14 L4.5,19.5 L4.5,8.5Z"   fill="#4285F4"/>
    </svg>
  );
}

function NavBar({ right }: { right?: React.ReactNode }) {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: 44, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', fontFamily: FF,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DelogatHex />
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>DELEGAT</span>
        </div>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 16px' }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#fff', fontSize: 12, fontWeight: 400, height: '100%',
          borderBottom: '1.5px solid rgba(255,255,255,0.7)', paddingBottom: 2,
        }}>
          <Target size={13} />
          War Room
        </div>
      </div>
      {right}
    </header>
  );
}

export function RescueWorkspace({ initialData }: { initialData: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data] = useState(initialData);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    initialData?.artifacts?.[0]?.id || null
  );
  const [isRecovering, setIsRecovering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      alert(errorMsg);
      router.replace('/war-room');
    }
  }, [searchParams, router]);

  if (!data?.commitment) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: FF }}>
        <NavBar />
        <main style={{ paddingTop: 44 }}>
          <RescueBriefForm />
        </main>
      </div>
    );
  }

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/rescue/' + data.commitment.id, { method: 'DELETE' });
      if (res.ok) window.location.reload();
    } catch (err) { console.error(err); }
    finally { setIsResetting(false); }
  };

  const handleRecover = async () => {
    setIsRecovering(true);
    try {
      const res = await fetch('/api/rescue/' + data.commitment.id + '/recover', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lost_minutes: 90 }),
      });
      if (res.ok) window.location.reload();
    } finally { setIsRecovering(false); }
  };

  const handleGenerate = async () => {
    if (!selectedArtifactId) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/rescue/artifacts/' + selectedArtifactId, { method: 'POST' });
      if (res.ok) window.location.reload();
    } finally { setIsGenerating(false); }
  };

  const handleBookCalendar = async () => {
    setIsBooking(true);
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitmentId: data.commitment.id }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.adapter === 'ics' && result.ics) {
          const blob = new Blob([result.ics], { type: 'text/calendar;charset=utf-8' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `rescue_plan_${data.commitment.id}.ics`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Google Calendar booked successfully!');
        }
        router.refresh();
      } else {
        alert('Failed to book calendar.');
      }
    } catch (err) { console.error(err); alert('Error booking calendar.'); }
    finally { setIsBooking(false); }
  };

  const navRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={handleRecover} disabled={isRecovering}
        style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#0066cc', color:'#fff', fontSize:12, fontWeight:500, padding:'5px 14px', borderRadius:9999, border:'none', cursor:'pointer', opacity: isRecovering ? 0.6 : 1, fontFamily: FF }}>
        {isRecovering ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
        I lost 90 minutes
      </button>
      <button onClick={handleBookCalendar} disabled={isBooking}
        style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#1d1d1f', color:'#fff', fontSize:12, fontWeight:500, padding:'5px 14px', borderRadius:8, border:'none', cursor:'pointer', opacity: isBooking ? 0.6 : 1, fontFamily: FF }}>
        {isBooking ? <Loader2 size={12} className="animate-spin" /> : <CalendarIcon size={12} />}
        Book / Sync Calendar
      </button>
      <a href="/api/calendar/connect"
        style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', color:'rgba(255,255,255,0.65)', fontSize:12, fontWeight:400, padding:'5px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.15)', textDecoration:'none', fontFamily: FF }}>
        <Link2 size={12} />
        Connect Google Calendar
      </a>
      <button onClick={handleReset} disabled={isResetting}
        style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', color:'#ff453a', fontSize:12, fontWeight:400, padding:'5px 12px', borderRadius:8, border:'1px solid rgba(255,69,58,0.2)', cursor:'pointer', opacity: isResetting ? 0.6 : 1, fontFamily: FF }}>
        {isResetting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        New Brief
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: FF, display: 'flex', flexDirection: 'column' }}>
      <NavBar right={navRight} />
      <main style={{
        flex: 1,
        paddingTop: 44 + 20,
        paddingBottom: 48,
        paddingLeft: 24,
        paddingRight: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        maxWidth: 1440,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <PlanSummary commitment={data.commitment} />
        <RescueBoard
          tasks={data.tasks || []}
          commitmentId={data.commitment.id}
          onRefresh={() => window.location.reload()}
        />
        <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 520 }}>
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <Timeline tasks={data.tasks || []} deadline={data.commitment.deadline} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <ArtifactStudio
              artifacts={data.artifacts || []}
              selectedId={selectedArtifactId}
              onSelect={setSelectedArtifactId}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
            <ExecutionLedger executions={data.executions || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
