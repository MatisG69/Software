-- ============================================
-- Schema SQL pour ELYNDRA · TRAJECTORY OS
-- Plateforme de recrutement 100% anonyme
-- ============================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: profiles
-- Table principale pour stocker les profils utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'company')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: candidates
-- Profils détaillés des candidats
-- ============================================
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  certified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: candidate_profiles
-- Profils détaillés des candidats (compétences, expérience, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  skills TEXT[] DEFAULT '{}',
  experience INTEGER DEFAULT 0,
  education TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id)
);

-- ============================================
-- Table: companies
-- Profils des entreprises
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: job_offers
-- Offres d'emploi publiées par les entreprises
-- ============================================
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
  category TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: applications
-- Candidatures des candidats aux offres d'emploi
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_offer_id UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_offer_id, candidate_id)
);

-- ============================================
-- Table: messages
-- Messages anonymes entre candidats et entreprises
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: notifications
-- Notifications pour les utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('application', 'message', 'job_match', 'verification')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes pour améliorer les performances
-- ============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Candidates
CREATE INDEX IF NOT EXISTS idx_candidates_verification_status ON candidates(verification_status);
CREATE INDEX IF NOT EXISTS idx_candidates_certified ON candidates(certified);

-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Job offers
CREATE INDEX IF NOT EXISTS idx_job_offers_company_id ON job_offers(company_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_location ON job_offers(location);
CREATE INDEX IF NOT EXISTS idx_job_offers_type ON job_offers(type);
CREATE INDEX IF NOT EXISTS idx_job_offers_category ON job_offers(category);
CREATE INDEX IF NOT EXISTS idx_job_offers_created_at ON job_offers(created_at DESC);

-- Applications
CREATE INDEX IF NOT EXISTS idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_application_id ON messages(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- Fonctions pour mettre à jour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_candidate_profiles_updated_at ON candidate_profiles;
CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_offers_updated_at ON job_offers;
CREATE TRIGGER update_job_offers_updated_at BEFORE UPDATE ON job_offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Fonction pour créer automatiquement un profil
-- quand un utilisateur s'inscrit
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
  );
  
  -- Si c'est un candidat, créer l'entrée dans candidates
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'candidate') = 'candidate' THEN
    INSERT INTO public.candidates (id, first_name, last_name)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'firstName',
      NEW.raw_user_meta_data->>'lastName'
    );
  END IF;
  
  -- Si c'est une entreprise, créer l'entrée dans companies
  IF NEW.raw_user_meta_data->>'role' = 'company' THEN
    INSERT INTO public.companies (id, name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'companyName', '')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies pour profiles
-- ============================================

-- Tout le monde peut voir les profils (pour vérifier l'existence)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- Policies pour candidates
-- ============================================

-- Les candidats peuvent voir leur propre profil
CREATE POLICY "Candidates can view their own profile" ON candidates
  FOR SELECT USING (auth.uid() = id);

-- Les candidats peuvent mettre à jour leur propre profil
CREATE POLICY "Candidates can update their own profile" ON candidates
  FOR UPDATE USING (auth.uid() = id);

-- Les entreprises peuvent voir les candidats (anonymement) via les candidatures
-- Mais elles ne voient pas les informations personnelles (first_name, last_name)
-- C'est géré au niveau de l'application, pas de la base de données

-- ============================================
-- Policies pour candidate_profiles
-- ============================================

-- Les candidats peuvent voir leur propre profil
CREATE POLICY "Candidates can view their own profile data" ON candidate_profiles
  FOR SELECT USING (auth.uid() = candidate_id);

-- Les candidats peuvent mettre à jour leur propre profil
CREATE POLICY "Candidates can update their own profile data" ON candidate_profiles
  FOR UPDATE USING (auth.uid() = candidate_id);

-- Les candidats peuvent insérer leur propre profil
CREATE POLICY "Candidates can insert their own profile data" ON candidate_profiles
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Les entreprises peuvent voir les profils candidats (anonymement) via les candidatures
-- Mais elles ne voient pas les informations personnelles
-- C'est géré au niveau de l'application

-- ============================================
-- Policies pour companies
-- ============================================

-- Tout le monde peut voir les entreprises
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

-- Les entreprises peuvent mettre à jour leur propre profil
CREATE POLICY "Companies can update their own profile" ON companies
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- Policies pour job_offers
-- ============================================

-- Tout le monde peut voir les offres d'emploi
CREATE POLICY "Job offers are viewable by everyone" ON job_offers
  FOR SELECT USING (true);

-- Les entreprises peuvent créer des offres
CREATE POLICY "Companies can create job offers" ON job_offers
  FOR INSERT WITH CHECK (auth.uid() = company_id);

-- Les entreprises peuvent mettre à jour leurs propres offres
CREATE POLICY "Companies can update their own job offers" ON job_offers
  FOR UPDATE USING (auth.uid() = company_id);

-- Les entreprises peuvent supprimer leurs propres offres
CREATE POLICY "Companies can delete their own job offers" ON job_offers
  FOR DELETE USING (auth.uid() = company_id);

-- ============================================
-- Policies pour applications
-- ============================================

-- Les candidats peuvent voir leurs propres candidatures
CREATE POLICY "Candidates can view their own applications" ON applications
  FOR SELECT USING (auth.uid() = candidate_id);

-- Les entreprises peuvent voir les candidatures pour leurs offres
CREATE POLICY "Companies can view applications for their job offers" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_offers
      WHERE job_offers.id = applications.job_offer_id
      AND job_offers.company_id = auth.uid()
    )
  );

-- Les candidats peuvent créer des candidatures
CREATE POLICY "Candidates can create applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Les entreprises peuvent mettre à jour le statut des candidatures pour leurs offres
CREATE POLICY "Companies can update applications for their job offers" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM job_offers
      WHERE job_offers.id = applications.job_offer_id
      AND job_offers.company_id = auth.uid()
    )
  );

-- ============================================
-- Policies pour messages
-- ============================================

-- Les utilisateurs peuvent voir les messages où ils sont expéditeur ou destinataire
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Les utilisateurs peuvent créer des messages pour leurs candidatures/applications
CREATE POLICY "Users can create messages for their applications" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
      EXISTS (
        SELECT 1 FROM applications
        WHERE applications.id = messages.application_id
        AND (applications.candidate_id = auth.uid() OR 
             EXISTS (
               SELECT 1 FROM job_offers
               WHERE job_offers.id = applications.job_offer_id
               AND job_offers.company_id = auth.uid()
             ))
      )
    )
  );

-- Les utilisateurs peuvent mettre à jour leurs messages (marquer comme lu)
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================
-- Policies pour notifications
-- ============================================

-- Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres notifications
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs propres notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Fonctions utiles
-- ============================================

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Commentaires sur les tables
-- ============================================

COMMENT ON TABLE profiles IS 'Table principale des profils utilisateurs';
COMMENT ON TABLE candidates IS 'Profils détaillés des candidats';
COMMENT ON TABLE candidate_profiles IS 'Compétences et expérience des candidats';
COMMENT ON TABLE companies IS 'Profils des entreprises';
COMMENT ON TABLE job_offers IS 'Offres d''emploi publiées par les entreprises';
COMMENT ON TABLE applications IS 'Candidatures des candidats aux offres';
COMMENT ON TABLE messages IS 'Messages anonymes entre candidats et entreprises';
COMMENT ON TABLE notifications IS 'Notifications pour les utilisateurs';

