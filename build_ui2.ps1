$ProgressPreference = 'SilentlyContinue'

# Move page.tsx to standalone route
$warRoomDir = "e:\vibe2ship\src\app\war-room"
if (!(Test-Path $warRoomDir)) { New-Item -ItemType Directory -Force -Path $warRoomDir | Out-Null }
Move-Item -Path "e:\vibe2ship\src\app\(dashboard)\war-room\page.tsx" -Destination "$warRoomDir\page.tsx" -Force
Remove-Item -Path "e:\vibe2ship\src\app\(dashboard)\war-room" -Recurse -Force -ErrorAction SilentlyContinue

# Update RescueWorkspace to add interactivity
$dir = "e:\vibe2ship\src\components\rescue"
Set-Content -Path "$dir\RescueWorkspace.tsx" -Value @"
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlanSummary } from './PlanSummary';
import { RescueBoard } from './RescueBoard';
import { Timeline } from './Timeline';
import { ArtifactStudio } from './ArtifactStudio';
import { ExecutionLedger } from './ExecutionLedger';
import { Target, Calendar as CalendarIcon, Clock, AlertTriangle, Loader2 } from 'lucide-react';

export function RescueWorkspace({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(initialData?.artifacts?.[0]?.id || null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!data?.commitment) {
    return <div className="p-8 text-center text-slate-500">No active rescue plan found.</div>;
  }

  const handleRecover = async () => {
    setIsRecovering(true);
    try {
      const res = await fetch(\`/api/rescue/\${data.commitment.id}/recover\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lost_minutes: 90 })
      });
      if (res.ok) {
        const updated = await res.json();
        // Since we modified backend state, we can refresh the route to get updated data
        router.refresh();
      }
    } finally {
      setIsRecovering(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedArtifactId) return;
    setIsGenerating(true);
    try {
      const res = await fetch(\`/api/rescue/artifacts/\${selectedArtifactId}\`, {
        method: 'POST'
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8 h-full">
          <div className="font-bold text-lg tracking-tight flex items-center gap-2">
            DELEGAT
          </div>
          <div className="flex items-center h-full border-b-2 border-slate-900 px-1 gap-2 text-sm font-medium">
            <Target className="w-4 h-4" />
            War Room
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRecover}
            disabled={isRecovering}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded flex items-center gap-2 transition-colors"
          >
            {isRecovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
            I lost 90 minutes
          </button>
          <a href="/api/calendar/connect" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium px-4 py-2 rounded flex items-center gap-2 transition-colors">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            Connect Google Calendar
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-auto">
        <PlanSummary commitment={data.commitment} />
        
        <RescueBoard tasks={data.tasks || []} />
        
        <div className="flex gap-6 min-h-[500px]">
          <div className="w-[300px] shrink-0 h-full flex flex-col">
            <Timeline tasks={data.tasks || []} deadline={data.commitment.deadline} />
          </div>
          <div className="flex-1 flex flex-col gap-6 min-w-0 h-full">
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
"@

Set-Content -Path "$dir\ArtifactStudio.tsx" -Value @"
import React from 'react';
import { Sparkles, Maximize2, Loader2 } from 'lucide-react';

export function ArtifactStudio({ artifacts, selectedId, onSelect, onGenerate, isGenerating }: { artifacts: any[], selectedId: string | null, onSelect: (id: string) => void, onGenerate: () => void, isGenerating: boolean }) {
  const selected = artifacts.find(a => a.id === selectedId) || artifacts[0];

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-[300px]">
      <div className="px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center h-[52px]">
          <div className="font-semibold text-sm py-3 pr-6 border-r border-slate-200 h-full flex items-center">Artifact studio</div>
          <div className="flex h-full">
            {artifacts.map(a => (
              <button 
                key={a.id}
                onClick={() => onSelect(a.id)}
                className={\`px-4 h-full flex items-center text-sm font-medium border-b-2 \${selected?.id === a.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
              >
                {a.title} {selected?.id === a.id && ''}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={onGenerate}
          disabled={isGenerating || !selected || selected.content}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
        >
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} 
          Generate artifact
        </button>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 bg-[#f8fafc] font-mono text-xs overflow-y-auto border-r border-slate-200 whitespace-pre-wrap">
          {selected?.content || 'No content generated yet. Click "Generate artifact" to begin.'}
        </div>
        <div className="w-64 p-4 text-sm bg-white overflow-y-auto shrink-0">
          <h3 className="font-semibold mb-2">Artifact notes</h3>
          <p className="text-slate-600 text-xs mb-6">
            AI drafted this {selected?.title.toLowerCase()} based on your materials and the rescue plan. Edit freely. Changes auto-save.
          </p>
          <div className="mb-4 text-xs">
            <div className="font-semibold text-slate-700">Last updated</div>
            <div className="text-slate-500">{selected?.updated_at ? new Date(selected.updated_at).toLocaleTimeString() : 'Pending'}</div>
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-700">Source</div>
            <div className="text-slate-500">Your files + AI analysis</div>
          </div>
        </div>
      </div>
    </div>
  );
}
"@
