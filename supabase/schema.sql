-- AuraProcure Database Schema
-- Run this in your Supabase SQL Editor

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','awaiting_approval','completed','failed')),
  parsed_items JSONB DEFAULT '[]'::jsonb,
  total_budget NUMERIC,
  total_savings NUMERIC,
  deadline TIMESTAMPTZ,
  result_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Mission Steps (agent reasoning trace)
CREATE TABLE IF NOT EXISTS mission_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  action TEXT NOT NULL,
  reasoning TEXT,
  result TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed','skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_whitelisted BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor Quotes
CREATE TABLE IF NOT EXISTS vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  vendor_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  unit_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  availability TEXT DEFAULT 'In Stock',
  shipping_days INTEGER DEFAULT 3,
  selected BOOLEAN DEFAULT false,
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance Policies
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  rule_text TEXT NOT NULL,
  threshold_amount NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generated Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('rfq','purchase_order','invoice','contract_summary')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Approval Requests (HITL)
CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approver TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Logs
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info','warn','error','debug')),
  message TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mission_steps_mission ON mission_steps(mission_id);
CREATE INDEX IF NOT EXISTS idx_vendor_quotes_mission ON vendor_quotes(mission_id);
CREATE INDEX IF NOT EXISTS idx_documents_mission ON documents(mission_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_mission ON approval_requests(mission_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_mission ON agent_logs(mission_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_policies_active ON policies(is_active);
