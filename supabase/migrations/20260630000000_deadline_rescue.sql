-- Relaxing constraints for commitments
ALTER TABLE commitments DROP CONSTRAINT IF EXISTS commitments_type_check;
ALTER TABLE commitments ADD CONSTRAINT commitments_type_check CHECK (type IN ('writing', 'coding', 'research', 'admin', 'creative', 'meeting', 'health', 'learning', 'unknown', 'rescue'));

-- Adding fields to commitments
ALTER TABLE commitments ADD COLUMN IF NOT EXISTS available_minutes integer;
ALTER TABLE commitments ADD COLUMN IF NOT EXISTS required_minutes integer;
ALTER TABLE commitments ADD COLUMN IF NOT EXISTS recovered_minutes integer;
ALTER TABLE commitments ADD COLUMN IF NOT EXISTS confidence_score integer;
ALTER TABLE commitments ADD COLUMN IF NOT EXISTS risk_explanation text;
ALTER TABLE commitments ADD COLUMN IF NOT EXISTS constraints text[];

-- Adding fields to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS lane text CHECK (lane IN ('must_do', 'ai_execute', 'human_work', 'drop'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS rationale text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS depends_on uuid[];

-- Artifacts table
CREATE TABLE IF NOT EXISTS artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  commitment_id uuid REFERENCES commitments(id) NOT NULL,
  task_id uuid REFERENCES tasks(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('brief', 'outline', 'email_draft')),
  title text NOT NULL,
  content text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS and indexing for artifacts
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own artifacts" ON artifacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own artifacts" ON artifacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artifacts" ON artifacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_commitment_id ON artifacts(commitment_id);

-- Extend execution agents and action types
ALTER TABLE executions DROP CONSTRAINT IF EXISTS executions_agent_check;
ALTER TABLE executions ADD CONSTRAINT executions_agent_check CHECK (agent IN ('breakdown', 'scheduling', 'planner', 'maker', 'recovery', 'calendar'));

ALTER TABLE executions DROP CONSTRAINT IF EXISTS executions_action_type_check;
ALTER TABLE executions ADD CONSTRAINT executions_action_type_check CHECK (action_type IN ('decompose', 'estimate', 'schedule', 'plan', 'generate_artifact', 'recover', 'calendar_connect', 'calendar_create', 'calendar_fallback'));
