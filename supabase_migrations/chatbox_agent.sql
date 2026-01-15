-- ============================================
-- Tables pour le système d'agent ChatBox
-- Mémoire persistante et apprentissage
-- ============================================

-- Table pour stocker les conversations
CREATE TABLE IF NOT EXISTS chatbox_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chatbox_conversations_user_id ON chatbox_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbox_conversations_session_id ON chatbox_conversations(session_id);

-- Table pour stocker les messages avec contexte
CREATE TABLE IF NOT EXISTS chatbox_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chatbox_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tools_called JSONB, -- Actions exécutées
  rag_context JSONB, -- Contexte RAG utilisé
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chatbox_messages_conversation_id ON chatbox_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbox_messages_created_at ON chatbox_messages(created_at);

-- Table pour stocker les préférences utilisateur apprises
CREATE TABLE IF NOT EXISTS chatbox_user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL, -- 'job_category', 'location', 'salary_range', etc.
  preference_value JSONB NOT NULL,
  confidence_score FLOAT DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  learned_from TEXT NOT NULL CHECK (learned_from IN ('explicit', 'implicit', 'behavior')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_type)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chatbox_user_preferences_user_id ON chatbox_user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbox_user_preferences_type ON chatbox_user_preferences(preference_type);

-- Table pour stocker les patterns de comportement
CREATE TABLE IF NOT EXISTS chatbox_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('search_pattern', 'application_pattern', 'message_pattern', 'favorite_pattern')),
  pattern_data JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chatbox_behavior_patterns_user_id ON chatbox_behavior_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbox_behavior_patterns_type ON chatbox_behavior_patterns(pattern_type);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_chatbox_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour chatbox_conversations
DROP TRIGGER IF EXISTS update_chatbox_conversations_updated_at ON chatbox_conversations;
CREATE TRIGGER update_chatbox_conversations_updated_at
  BEFORE UPDATE ON chatbox_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbox_updated_at();

-- Trigger pour chatbox_user_preferences
DROP TRIGGER IF EXISTS update_chatbox_user_preferences_updated_at ON chatbox_user_preferences;
CREATE TRIGGER update_chatbox_user_preferences_updated_at
  BEFORE UPDATE ON chatbox_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbox_updated_at();

-- RLS (Row Level Security) - Sécurité
ALTER TABLE chatbox_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbox_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbox_behavior_patterns ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : Les utilisateurs ne peuvent accéder qu'à leurs propres données
DROP POLICY IF EXISTS "Users can view their own conversations" ON chatbox_conversations;
CREATE POLICY "Users can view their own conversations"
  ON chatbox_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own conversations" ON chatbox_conversations;
CREATE POLICY "Users can insert their own conversations"
  ON chatbox_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own messages" ON chatbox_messages;
CREATE POLICY "Users can view their own messages"
  ON chatbox_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chatbox_conversations
      WHERE chatbox_conversations.id = chatbox_messages.conversation_id
      AND chatbox_conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own messages" ON chatbox_messages;
CREATE POLICY "Users can insert their own messages"
  ON chatbox_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbox_conversations
      WHERE chatbox_conversations.id = chatbox_messages.conversation_id
      AND chatbox_conversations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their own preferences" ON chatbox_user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON chatbox_user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own preferences" ON chatbox_user_preferences;
CREATE POLICY "Users can manage their own preferences"
  ON chatbox_user_preferences FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own behavior patterns" ON chatbox_behavior_patterns;
CREATE POLICY "Users can view their own behavior patterns"
  ON chatbox_behavior_patterns FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own behavior patterns" ON chatbox_behavior_patterns;
CREATE POLICY "Users can manage their own behavior patterns"
  ON chatbox_behavior_patterns FOR ALL
  USING (auth.uid() = user_id);
