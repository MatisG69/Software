-- ============================================
-- Table: user_certified
-- Enregistre les vérifications des utilisateurs (candidats)
-- ============================================
CREATE TABLE IF NOT EXISTS user_certified (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cv_file_name TEXT NOT NULL,
  cv_file_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id)
);

-- Index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_user_certified_candidate_id ON user_certified(candidate_id);
CREATE INDEX IF NOT EXISTS idx_user_certified_verified_at ON user_certified(verified_at);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_user_certified_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS trigger_update_user_certified_updated_at ON user_certified;
CREATE TRIGGER trigger_update_user_certified_updated_at
  BEFORE UPDATE ON user_certified
  FOR EACH ROW
  EXECUTE FUNCTION update_user_certified_updated_at();

-- RLS (Row Level Security)
ALTER TABLE user_certified ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent lire leurs propres vérifications
CREATE POLICY "Users can view their own certifications"
  ON user_certified
  FOR SELECT
  USING (auth.uid()::text = candidate_id::text);

-- Politique : Les utilisateurs peuvent insérer leurs propres vérifications
CREATE POLICY "Users can insert their own certifications"
  ON user_certified
  FOR INSERT
  WITH CHECK (auth.uid()::text = candidate_id::text);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres vérifications
CREATE POLICY "Users can update their own certifications"
  ON user_certified
  FOR UPDATE
  USING (auth.uid()::text = candidate_id::text);

-- Politique : Les entreprises peuvent voir les vérifications (pour voir si un candidat est certifié)
CREATE POLICY "Companies can view certifications"
  ON user_certified
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      INNER JOIN job_offers jo ON a.job_offer_id = jo.id
      WHERE jo.company_id::text = auth.uid()::text
      AND a.candidate_id = user_certified.candidate_id
    )
  );

