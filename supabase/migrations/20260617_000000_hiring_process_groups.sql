-- Hiring process groups: allows empresa users to categorize processes by event/campaign

CREATE TABLE IF NOT EXISTS hiring_process_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hiring_processes
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES hiring_process_groups(id) ON DELETE SET NULL;

ALTER TABLE hiring_process_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresa_members_select_groups" ON hiring_process_groups
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM empresa_miembros
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "empresa_members_insert_groups" ON hiring_process_groups
  FOR INSERT WITH CHECK (
    empresa_id IN (
      SELECT empresa_id FROM empresa_miembros
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "empresa_members_update_groups" ON hiring_process_groups
  FOR UPDATE USING (
    empresa_id IN (
      SELECT empresa_id FROM empresa_miembros
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "empresa_members_delete_groups" ON hiring_process_groups
  FOR DELETE USING (
    empresa_id IN (
      SELECT empresa_id FROM empresa_miembros
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
