$ProgressPreference = 'SilentlyContinue'
$dir = "e:\vibe2ship\src\components\rescue"
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$appDir = "e:\vibe2ship\src\app\(dashboard)\war-room"
if (!(Test-Path $appDir)) { New-Item -ItemType Directory -Force -Path $appDir | Out-Null }

Set-Content -Path "$dir\RescueWorkspace.tsx" -Value @"
'use client';
import React, { useState, useEffect } from 'react';
import { PlanSummary } from './PlanSummary';
import { RescueBoard } from './RescueBoard';
import { Timeline } from './Timeline';
import { ArtifactStudio } from './ArtifactStudio';
import { ExecutionLedger } from './ExecutionLedger';
import { Target, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function RescueWorkspace({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

  if (!data?.commitment) {
    return <div className="p-8">No rescue plan found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-8 h-full">
          <div className="font-bold text-lg tracking-tight">DELEGAT</div>
          <div className="flex items-center h-full border-b-2 border-slate-900 px-1 gap-2 text-sm font-medium">
            <Target className="w-4 h-4" />
            War Room
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded flex items-center gap-2 transition-colors">
            <Clock className="w-4 h-4" />
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
        
        <div className="flex gap-6 h-[500px]">
          <div className="w-[300px] shrink-0">
            <Timeline tasks={data.tasks || []} deadline={data.commitment.deadline} />
          </div>
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <ArtifactStudio 
              artifacts={data.artifacts || []} 
              selectedId={selectedArtifactId}
              onSelect={setSelectedArtifactId}
            />
            <ExecutionLedger executions={data.executions || []} />
          </div>
        </div>
      </main>
    </div>
  );
}
"@

Set-Content -Path "$dir\PlanSummary.tsx" -Value @"
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

function formatMinutes(mins: number) {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? \`\${h}h \${m}m\` : \`\${m}m\`;
}

export function PlanSummary({ commitment }: { commitment: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 flex justify-between items-center shadow-sm">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{commitment.title || 'Rescue Plan'}</h1>
        <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
          <span>Deadline {format(new Date(commitment.deadline), 'MMM d, h:mm a')}</span>
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>
      
      <div className="flex gap-12 text-center">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Required</div>
          <div className="text-2xl font-medium">{formatMinutes(commitment.required_minutes)}</div>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Available</div>
          <div className="text-2xl font-medium">{formatMinutes(commitment.available_minutes)}</div>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recovered</div>
          <div className="text-2xl font-medium text-amber-600">{formatMinutes(commitment.recovered_minutes)}</div>
        </div>
        <div className="w-px bg-slate-200"></div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confidence</div>
          <div className="text-2xl font-medium">{commitment.confidence_score}%</div>
        </div>
      </div>
    </div>
  );
}
"@

Set-Content -Path "$dir\RescueBoard.tsx" -Value @"
import React from 'react';
import { AlertCircle, Sparkles, User, Trash2, Plus } from 'lucide-react';

const LANES = [
  { id: 'must_do', title: 'Must do', icon: AlertCircle, color: 'text-red-500' },
  { id: 'ai_execute', title: 'AI executes', icon: Sparkles, color: 'text-blue-500' },
  { id: 'human_work', title: 'Human work', icon: User, color: 'text-slate-500' },
  { id: 'drop', title: 'Drop', icon: Trash2, color: 'text-slate-500' }
];

export function RescueBoard({ tasks }: { tasks: any[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">Rescue board</div>
      <div className="flex divide-x divide-slate-200 overflow-x-auto">
        {LANES.map(lane => {
          const laneTasks = tasks.filter(t => t.lane === lane.id);
          const totalMins = laneTasks.reduce((s, t) => s + (t.estimated_minutes || 0), 0);
          
          return (
            <div key={lane.id} className="flex-1 min-w-[280px] p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <lane.icon className={\`w-4 h-4 \${lane.color}\`} />
                <span className="font-semibold">{lane.title}</span>
                <span className="text-xs text-slate-500 ml-auto">{Math.floor(totalMins/60)}h {totalMins%60}m</span>
              </div>
              
              <div className="flex text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
                <span className="flex-1">Task</span>
                <span className="w-12 text-center">Dur</span>
                <span className="w-20 text-right">Rationale</span>
              </div>
              
              <div className="flex flex-col gap-2 flex-1">
                {laneTasks.map(t => (
                  <div key={t.id} className="flex items-center text-sm py-2 px-1 hover:bg-slate-50 rounded">
                    <span className="flex-1 truncate font-medium">{t.title}</span>
                    <span className="w-12 text-center text-slate-500">{t.estimated_minutes}m</span>
                    <span className="w-20 text-right text-slate-500 truncate text-xs">{t.rationale}</span>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
                <Plus className="w-4 h-4" /> Add task
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"@

Set-Content -Path "$dir\Timeline.tsx" -Value @"
import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export function Timeline({ tasks, deadline }: { tasks: any[], deadline: string }) {
  const activeTasks = tasks.filter(t => t.lane !== 'drop');
  
  let current = new Date();
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">Schedule</div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative pl-14">
          <div className="absolute left-[39px] top-2 bottom-0 w-px bg-slate-200"></div>
          
          {activeTasks.map((t, i) => {
            const startStr = i === 0 ? 'Now' : format(current, 'h:mm a');
            current = new Date(current.getTime() + (t.estimated_minutes * 60000));
            
            return (
              <div key={t.id} className="relative mb-6 text-sm flex items-start">
                <div className="absolute -left-14 w-12 text-right text-xs text-slate-500 font-medium leading-5">
                  {startStr}
                </div>
                <div className={\`absolute -left-[19px] top-1.5 w-2 h-2 rounded-full border-2 border-white ring-1 \${t.lane === 'ai_execute' ? 'bg-blue-500 ring-blue-500' : 'bg-slate-400 ring-slate-400'}\`}></div>
                
                <div className="flex-1 pr-2">
                  <div className="font-medium">{t.lane === 'ai_execute' ? <span className="font-semibold">AI executes:</span> : null} {t.title}</div>
                </div>
                <div className="text-slate-500 w-10 text-right">{t.estimated_minutes}m</div>
                <div className="w-6 ml-2 text-slate-400 flex justify-end">
                  {t.lane === 'ai_execute' ? <Sparkles className="w-4 h-4 text-blue-500" /> : <User className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
          
          {/* Deadline */}
          <div className="relative mt-8 text-sm flex items-start text-red-600 font-medium">
            <div className="absolute -left-14 w-12 text-right text-xs leading-5">
              Deadline
            </div>
            <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-red-500 ring-1 ring-red-500 border-2 border-white"></div>
            <div className="flex-1">
              Tomorrow, {format(new Date(deadline), 'h:mm a')}
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-slate-400">All times shown in your time zone</div>
      </div>
    </div>
  );
}
"@

Set-Content -Path "$dir\ArtifactStudio.tsx" -Value @"
import React from 'react';
import { Sparkles, Maximize2 } from 'lucide-react';

export function ArtifactStudio({ artifacts, selectedId, onSelect }: { artifacts: any[], selectedId: string | null, onSelect: (id: string) => void }) {
  const selected = artifacts.find(a => a.id === selectedId) || artifacts[0];

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
      <div className="px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex">
          <div className="font-semibold text-sm py-3 pr-6 border-r border-slate-200">Artifact studio</div>
          <div className="flex">
            {artifacts.map(a => (
              <button 
                key={a.id}
                onClick={() => onSelect(a.id)}
                className={\`px-4 py-3 text-sm font-medium border-b-2 \${selected?.id === a.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
              >
                {a.title} {selected?.id === a.id && '(selected)'}
              </button>
            ))}
          </div>
        </div>
        <button className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Generate artifacts
        </button>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 bg-[#f8fafc] font-mono text-xs overflow-y-auto border-r border-slate-200 whitespace-pre-wrap">
          {selected?.content || 'No content generated yet.'}
        </div>
        <div className="w-64 p-4 text-sm bg-white overflow-y-auto">
          <h3 className="font-semibold mb-2">Artifact notes</h3>
          <p className="text-slate-600 text-xs mb-6">
            AI drafted this artifact based on your materials and the rescue plan. Edit freely. Changes auto-save.
          </p>
          <div className="mb-4 text-xs">
            <div className="font-semibold text-slate-700">Last updated</div>
            <div className="text-slate-500">Just now</div>
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

Set-Content -Path "$dir\ExecutionLedger.tsx" -Value @"
import React from 'react';
import { format } from 'date-fns';
import { ExternalLink, MessageSquare } from 'lucide-react';

export function ExecutionLedger({ executions }: { executions: any[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm">Execution ledger</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-2 font-semibold">Time</th>
              <th className="px-4 py-2 font-semibold">Item</th>
              <th className="px-4 py-2 font-semibold">Owner</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold">Details</th>
              <th className="px-4 py-2 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {executions.slice(0, 5).map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{format(new Date(e.created_at), 'h:mm a')}</td>
                <td className="px-4 py-2 font-medium">{e.action_type}</td>
                <td className="px-4 py-2 text-slate-500">{e.agent}</td>
                <td className="px-4 py-2">
                  <span className={\`inline-flex items-center gap-1.5 \${e.status === 'success' ? 'text-emerald-600' : 'text-blue-600'}\`}>
                    <div className={\`w-1.5 h-1.5 rounded-full \${e.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}\`}></div>
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500 text-xs truncate max-w-[200px]">{JSON.stringify(e.output_data)}</td>
                <td className="px-4 py-2 text-right space-x-2 text-slate-400">
                  <MessageSquare className="w-4 h-4 inline cursor-pointer hover:text-slate-600" />
                  <ExternalLink className="w-4 h-4 inline cursor-pointer hover:text-slate-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"@

Set-Content -Path "$appDir\page.tsx" -Value @"
import { RescueWorkspace } from '@/components/rescue/RescueWorkspace';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';

export default async function WarRoomPage() {
  const userId = await getDemoUserId().catch(() => null);
  let initialData = null;

  if (userId) {
    const supabase = getAdminClient();
    
    // Get latest active commitment
    const { data: commitment } = await supabase
      .from('commitments')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'rescue')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (commitment) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('commitment_id', commitment.id)
        .order('sort_order');

      const { data: artifacts } = await supabase
        .from('artifacts')
        .select('*')
        .eq('commitment_id', commitment.id);

      const { data: executions } = await supabase
        .from('executions')
        .select('*')
        .eq('commitment_id', commitment.id)
        .order('created_at', { ascending: false });

      initialData = {
        commitment,
        tasks: tasks || [],
        artifacts: artifacts || [],
        executions: executions || []
      };
    }
  }

  return <RescueWorkspace initialData={initialData} />;
}
"@
