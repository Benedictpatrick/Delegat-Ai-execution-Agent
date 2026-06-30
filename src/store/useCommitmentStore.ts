import { create } from 'zustand'
import { Database } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

type Commitment = Database['public']['Tables']['commitments']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Execution = Database['public']['Tables']['executions']['Row']

interface CommitmentState {
  commitments: Commitment[]
  tasks: Task[]
  nexusItems: any[]
  globalHealth: number
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchData: () => Promise<void>
  addCommitment: (commitment: Commitment) => void
  updateCommitmentStatus: (id: string, status: string) => void
  addNexusItem: (item: any) => void
  addTasks: (newTasks: any[]) => void
}

export const useCommitmentStore = create<CommitmentState>((set, get) => ({
  commitments: [],
  tasks: [],
  nexusItems: [],
  globalHealth: 100,
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/data')
      if (!res.ok) throw new Error('Failed to fetch data')
      
      const { commitments, tasks, nexusItems } = await res.json()
      
      // Calculate global health (average of health_scores of active commitments)
      const activeCommitments = commitments.filter((c: any) => c.status !== 'completed' && c.status !== 'deleted')
      let health = 100
      if (activeCommitments.length > 0) {
        const totalHealth = activeCommitments.reduce((sum: number, c: any) => sum + (c.health_score || 100), 0)
        health = Math.round(totalHealth / activeCommitments.length)
      }
      
      set({ 
        commitments, 
        tasks, 
        nexusItems,
        globalHealth: health,
        isLoading: false 
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  addCommitment: (commitment) => 
    set((state) => {
      const newCommitments = [commitment, ...state.commitments]
      return { commitments: newCommitments }
    }),

  updateCommitmentStatus: (id, status) =>
    set((state) => ({
      commitments: state.commitments.map((c) => 
        c.id === id ? { ...c, status } : c
      )
    })),

  addNexusItem: (item) =>
    set((state) => ({
      nexusItems: [item, ...state.nexusItems].slice(0, 50)
    })),

  addTasks: (newTasks) =>
    set((state) => ({
      tasks: [...state.tasks, ...newTasks]
    }))
}))
