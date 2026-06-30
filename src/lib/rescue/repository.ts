import { getAdminClient } from '../supabase/admin';
import { RescuePlan } from './contracts';
import crypto from 'crypto';

export async function persistRescuePlan(userId: string, plan: RescuePlan, rawInput: string): Promise<void> {
  const supabase = getAdminClient() as any;

  // Build metadata containing all fields (proposed schema columns)
  const meta = {
    is_rescue: true,
    available_minutes: plan.availableMinutes,
    required_minutes: plan.requiredMinutes,
    recovered_minutes: plan.recoveredMinutes,
    confidence_score: plan.confidence,
    risk_explanation: plan.riskExplanation,
    constraints: [],
    tasks: plan.tasks,
    artifacts: plan.artifacts,
    executions: [{
      id: crypto.randomUUID(),
      user_id: userId,
      commitment_id: plan.id,
      agent: 'planner',
      action_type: 'plan',
      status: 'success',
      created_at: new Date().toISOString(),
      output_data: { source: plan.source, generated_tasks: plan.tasks.length }
    }]
  };

  // 1. Try to insert commitment with new columns
  let insertPayload: any = {
    id: plan.id,
    user_id: userId,
    title: plan.title,
    raw_input: rawInput,
    source_type: 'text',
    status: 'active',
    type: 'rescue',
    importance: 5,
    deadline: plan.deadline,
    required_minutes: plan.requiredMinutes,
    available_minutes: plan.availableMinutes,
    recovered_minutes: plan.recoveredMinutes,
    confidence_score: plan.confidence,
    risk_explanation: plan.riskExplanation,
    metadata: meta,
  };

  let commitment: any = null;
  let commitError: any = null;

  try {
    const res = await supabase.from('commitments').insert(insertPayload).select().single();
    commitment = res.data;
    commitError = res.error;
  } catch (err: any) {
    commitError = err;
  }

  // Schema mismatch fallback (e.g. column not found or invalid check constraint on type)
  if (commitError && (commitError.message?.includes('column') || commitError.message?.includes('type') || commitError.code === '42703' || commitError.code === '23514')) {
    console.log('Inserting commitment using schema fallback...');
    insertPayload = {
      id: plan.id,
      user_id: userId,
      title: plan.title,
      raw_input: rawInput,
      source_type: 'text',
      status: 'active',
      type: 'research', // Use valid type from init migration
      importance: 5,
      deadline: plan.deadline,
      confidence_score: plan.confidence, // This exists in initial schema
      metadata: meta,
    };
    const fallbackRes = await supabase.from('commitments').insert(insertPayload).select().single();
    commitment = fallbackRes.data;
    commitError = fallbackRes.error;
  }

  if (commitError || !commitment) {
    throw new Error('Failed to insert commitment: ' + (commitError?.message || 'Unknown error'));
  }

  // 2. Persist Tasks
  const taskInserts = plan.tasks.map((t, index) => {
    // Store lane, rationale, depends_on in description as JSON string for fallback
    const descJson = JSON.stringify({
      lane: t.lane,
      rationale: t.rationale,
      depends_on: t.dependsOn
    });

    return {
      id: t.id,
      commitment_id: commitment.id,
      user_id: userId,
      title: t.title,
      description: descJson,
      type: 'research', // Use valid type from init schema
      execution_type: t.lane === 'ai_execute' ? 'auto_executable' : 'human_only',
      lane: t.lane,
      classification: t.lane,
      rationale: t.rationale,
      depends_on: t.dependsOn,
      estimated_minutes: t.estimatedMinutes,
      sort_order: index + 1,
      status: t.lane === 'drop' ? 'cancelled' : 'pending',
    };
  });

  if (taskInserts.length > 0) {
    let taskError: any = null;
    try {
      const res = await supabase.from('tasks').insert(taskInserts);
      taskError = res.error;
    } catch (err: any) {
      taskError = err;
    }

    if (taskError && (taskError.message?.includes('column') || taskError.code === '42703')) {
      console.log('Inserting tasks using schema fallback...');
      const strippedInserts = taskInserts.map(t => ({
        id: t.id,
        commitment_id: t.commitment_id,
        user_id: t.user_id,
        title: t.title,
        description: t.description,
        type: t.type,
        execution_type: t.execution_type,
        estimated_minutes: t.estimated_minutes,
        sort_order: t.sort_order,
        status: t.status,
      }));
      const fallbackRes = await supabase.from('tasks').insert(strippedInserts);
      taskError = fallbackRes.error;
    }

    if (taskError) {
      await logExecution(userId, commitment.id, 'planner', 'plan', 'failed', { error: taskError.message });
      throw new Error('Failed to insert tasks: ' + taskError.message);
    }
  }

  // 3. Persist Artifact Requests
  const artifactInserts = plan.artifacts.map((a) => ({
    id: a.id,
    user_id: userId,
    commitment_id: commitment.id,
    task_id: a.taskId,
    type: a.type,
    title: a.title,
    status: 'pending'
  }));

  if (artifactInserts.length > 0) {
    try {
      const { error: artifactError } = await supabase.from('artifacts').insert(artifactInserts);
      if (artifactError) {
        console.log('Artifacts table insert failed (stored in metadata instead):', artifactError.message);
      }
    } catch (err: any) {
      console.log('Artifacts table insert skipped (stored in metadata instead):', err.message);
    }
  }

  // 4. Record successful execution
  await logExecution(userId, commitment.id, 'planner', 'plan', 'success', { source: plan.source, generated_tasks: plan.tasks.length });
}

export async function logExecution(
  userId: string, 
  commitmentId: string, 
  agent: 'breakdown' | 'scheduling' | 'planner' | 'maker' | 'recovery' | 'calendar', 
  actionType: 'decompose' | 'estimate' | 'schedule' | 'plan' | 'generate_artifact' | 'recover' | 'calendar_connect' | 'calendar_create' | 'calendar_fallback',
  status: 'success' | 'failed',
  outputData: any
) {
  const supabase = getAdminClient() as any;

  // Update metadata execution list
  try {
    const { data: commitment } = await supabase
      .from('commitments')
      .select('metadata')
      .eq('id', commitmentId)
      .single();

    if (commitment) {
      const meta = commitment.metadata || {};
      const executions = meta.executions || [];
      executions.push({
        id: crypto.randomUUID(),
        user_id: userId,
        commitment_id: commitmentId,
        agent,
        action_type: actionType,
        status,
        created_at: new Date().toISOString(),
        output_data: outputData
      });
      await supabase
        .from('commitments')
        .update({ metadata: { ...meta, executions } })
        .eq('id', commitmentId);
    }
  } catch (err) {
    console.error('Failed to log execution in metadata:', err);
  }

  // Log in executions table (mapping enums for compatibility)
  try {
    const mappedAgent = agent === 'planner' || agent === 'maker' ? 'recovery' : agent;
    const mappedAction = actionType === 'plan' || actionType === 'generate_artifact' ? 'recover' : actionType;

    await supabase.from('executions').insert({
      user_id: userId,
      commitment_id: commitmentId,
      agent: mappedAgent,
      action_type: mappedAction,
      status,
      input_data: {},
      output_data: outputData,
    });
  } catch (err) {
    console.log('Executions table insert failed/skipped:', err);
  }
}
