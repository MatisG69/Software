-- ============================================
-- Mise à jour du schéma pour les nouveaux champs
-- ============================================

-- Ajouter les nouveaux champs à la table companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS what_you_will_live TEXT,
ADD COLUMN IF NOT EXISTS what_we_will_love TEXT,
ADD COLUMN IF NOT EXISTS who_we_are TEXT;

-- Ajouter les nouveaux champs à la table job_offers
ALTER TABLE job_offers
ADD COLUMN IF NOT EXISTS missions TEXT,
ADD COLUMN IF NOT EXISTS expected_experience TEXT,
ADD COLUMN IF NOT EXISTS other_information TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS what_you_will_live TEXT,
ADD COLUMN IF NOT EXISTS what_we_will_love TEXT,
ADD COLUMN IF NOT EXISTS who_we_are TEXT;

