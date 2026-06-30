-- Drop all check constraints on modified tables to normalize enums
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname, relname 
        FROM pg_constraint c 
        JOIN pg_class t ON c.conrelid = t.oid 
        WHERE t.relname IN ('commitments', 'tasks', 'executions') 
        AND contype = 'c'
    ) LOOP
        EXECUTE 'ALTER TABLE ' || r.relname || ' DROP CONSTRAINT ' || r.conname;
    END LOOP;
END $$;

-- Modify commitments
ALTER TABLE public.commitments
ADD COLUMN required_minutes INTEGER,
ADD COLUMN available_minutes INTEGER,
ADD COLUMN deadline_confidence INTEGER CHECK (deadline_confidence BETWEEN 0 AND 100),
ADD COLUMN risk_explanation TEXT;

-- Re-add non-enum check constraints for commitments
ALTER TABLE public.commitments
ADD CONSTRAINT commitments_health_score_check CHECK (health_score BETWEEN 0 AND 100),
ADD CONSTRAINT commitments_importance_check CHECK (importance BETWEEN 1 AND 5),
ADD CONSTRAINT commitments_confidence_score_check CHECK (confidence_score BETWEEN 0 AND 100);

-- Modify tasks
ALTER TABLE public.tasks
ADD COLUMN classification TEXT,
ADD COLUMN rationale TEXT;

-- Re-add non-enum check constraints for tasks
ALTER TABLE public.tasks
ADD CONSTRAINT tasks_estimated_minutes_check CHECK (estimated_minutes > 0);

-- Artifacts table
CREATE TABLE public.artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_artifacts_user_id ON public.artifacts(user_id);
CREATE INDEX idx_artifacts_task_id ON public.artifacts(task_id);

ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "artifacts_all_own" ON public.artifacts FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER trg_artifacts_updated_at BEFORE UPDATE ON public.artifacts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
