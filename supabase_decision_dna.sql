-- ============================================
-- Schema pour Decision DNA
-- Système de recrutement basé sur les trajectoires de décision
-- ============================================

-- Ajouter les champs Decision DNA à job_offers
ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS decision_dna_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS decision_dna_mode TEXT DEFAULT 'no_test' CHECK (decision_dna_mode IN ('standard_decision_dna', 'custom_company_test', 'no_test')),
ADD COLUMN IF NOT EXISTS decision_profile_target JSONB;

-- Table pour stocker les micro-scénarios personnalisés des entreprises
CREATE TABLE IF NOT EXISTS company_decision_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_offer_id UUID REFERENCES job_offers(id) ON DELETE CASCADE,
  scenario_order INTEGER NOT NULL,
  context_state JSONB DEFAULT '{}',
  decision_prompt TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {id, tradeoff_vector}
  time_limit INTEGER, -- en secondes, optionnel
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_offer_id, scenario_order)
);

-- Table pour stocker les réponses des candidats aux tests Decision DNA
CREATE TABLE IF NOT EXISTS decision_dna_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES company_decision_scenarios(id) ON DELETE SET NULL,
  scenario_order INTEGER NOT NULL,
  selected_option_id TEXT NOT NULL,
  context_state_before JSONB,
  context_state_after JSONB,
  response_time_ms INTEGER, -- temps de réponse en millisecondes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker le Decision DNA extrait de chaque candidature
CREATE TABLE IF NOT EXISTS candidate_decision_dna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
  decision_dna JSONB NOT NULL, -- {risk_tolerance, decision_speed, consistency, adaptability, ...}
  compatibility_score NUMERIC, -- score de compatibilité avec le profil cible
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_decision_scenarios_job_offer_id ON company_decision_scenarios(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_company_decision_scenarios_company_id ON company_decision_scenarios(company_id);
CREATE INDEX IF NOT EXISTS idx_decision_dna_responses_application_id ON decision_dna_responses(application_id);
CREATE INDEX IF NOT EXISTS idx_candidate_decision_dna_application_id ON candidate_decision_dna(application_id);
CREATE INDEX IF NOT EXISTS idx_candidate_decision_dna_compatibility_score ON candidate_decision_dna(compatibility_score DESC);

