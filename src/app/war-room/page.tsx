import { RescueWorkspace } from '@/components/rescue/RescueWorkspace';
import { getAdminClient, getDemoUserId } from '@/lib/supabase/admin';

export default async function WarRoomPage() {
  const userId = await getDemoUserId().catch(() => null);
  let initialData = null;

  if (userId) {
    const supabase = getAdminClient() as any;
    
    // Get all non-deleted commitments and filter latest rescue-plan (to bypass type check constraint on remote DB)
    const { data: commitments } = await supabase
      .from('commitments')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const commitment = commitments?.find((c: any) => !c.deleted_at && (c.metadata?.is_rescue === true || c.type === 'rescue'));

    if (commitment) {
      // Reconstruct commitment properties from metadata JSON if columns are missing
      const meta = commitment.metadata || {};

      // Recover available_minutes from raw_input when NaN was stored as null
      let availableMinutes = meta.available_minutes ?? commitment.available_minutes;
      if (availableMinutes == null) {
        try { availableMinutes = JSON.parse(commitment.raw_input || '{}').availableMinutes ?? 0; } catch {}
      }

      const mappedCommitment = {
        ...commitment,
        type: 'rescue', // Override for frontend
        available_minutes: availableMinutes,
        required_minutes: meta.required_minutes ?? commitment.required_minutes ?? 0,
        recovered_minutes: meta.recovered_minutes ?? commitment.recovered_minutes ?? 0,
        confidence_score: meta.confidence_score ?? commitment.confidence_score ?? 0,
        risk_explanation: meta.risk_explanation || commitment.risk_explanation,
        constraints: meta.constraints || commitment.constraints || [],
      };

      // Query tasks and parse description JSON for missing fields
      const { data: dbTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('commitment_id', commitment.id)
        .order('sort_order');

      const tasks = dbTasks && dbTasks.length > 0
        ? dbTasks.map((t: any) => {
          try {
            const descObj = JSON.parse(t.description || '{}');
            return {
              ...t,
              lane: descObj.lane || t.lane || 'human_work',
              rationale: descObj.rationale || t.rationale || '',
              dependsOn: descObj.depends_on || t.depends_on || [],
            };
          } catch {
            return {
              ...t,
              lane: t.lane || 'human_work',
              rationale: t.rationale || '',
              dependsOn: t.depends_on || [],
            };
          }
        })
        : (meta.tasks || []).map((t: any) => ({
          ...t,
          lane: t.lane || 'human_work',
          rationale: t.rationale || '',
          dependsOn: t.dependsOn || [],
          estimated_minutes: t.estimated_minutes ?? t.estimatedMinutes ?? 0,
        }));

      // Load artifacts from metadata (fallback since table doesn't exist)
      const artifacts = meta.artifacts || [];

      // Load executions from metadata
      const executions = meta.executions || [];

      initialData = {
        commitment: mappedCommitment,
        tasks: tasks || [],
        artifacts: artifacts || [],
        executions: executions || []
      };
    }
  }

  return <RescueWorkspace initialData={initialData} />;
}
