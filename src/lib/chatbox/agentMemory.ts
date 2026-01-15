// Mémoire persistante et apprentissage pour l'agent ChatBox
import { supabase } from '@/lib/supabase';
import { UserPreference, BehaviorPattern, ChatboxMessage } from './types';
import { AgentContext } from './types';

// ============================================
// GESTION DES CONVERSATIONS
// ============================================

export const createConversation = async (context: AgentContext): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('chatbox_conversations')
      .insert({
        user_id: context.userId,
        session_id: context.sessionId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createConversation:', error);
    return null;
  }
};

export const getConversationId = async (context: AgentContext): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('chatbox_conversations')
      .select('id')
      .eq('user_id', context.userId)
      .eq('session_id', context.sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Si erreur, en créer une nouvelle
      return await createConversation(context);
    }

    // Si aucune conversation trouvée (data est null), en créer une
    if (!data) {
      return await createConversation(context);
    }

    return data.id;
  } catch (error) {
    console.error('Error getting conversation:', error);
    return await createConversation(context);
  }
};

export const saveMessage = async (
  conversationId: string,
  message: ChatboxMessage
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chatbox_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        tools_called: message.tools_called ? JSON.stringify(message.tools_called) : null,
        rag_context: message.rag_context ? JSON.stringify(message.rag_context) : null,
      });

    if (error) {
      console.error('Error saving message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveMessage:', error);
    return false;
  }
};

export const getConversationHistory = async (
  context: AgentContext,
  limit: number = 20
): Promise<ChatboxMessage[]> => {
  try {
    const conversationId = await getConversationId(context);
    if (!conversationId) return [];

    const { data, error } = await supabase
      .from('chatbox_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }

    return (data || []).reverse().map((msg: any) => ({
      role: msg.role as ChatboxMessage['role'],
      content: msg.content,
      tools_called: msg.tools_called ? JSON.parse(msg.tools_called) : undefined,
      rag_context: msg.rag_context ? JSON.parse(msg.rag_context) : undefined,
    }));
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    return [];
  }
};

// ============================================
// GESTION DES PRÉFÉRENCES UTILISATEUR
// ============================================

export const saveUserPreference = async (
  context: AgentContext,
  preference: UserPreference
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chatbox_user_preferences')
      .upsert({
        user_id: context.userId,
        preference_type: preference.preference_type,
        preference_value: preference.preference_value,
        confidence_score: preference.confidence_score,
        learned_from: preference.learned_from,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,preference_type',
      });

    if (error) {
      console.error('Error saving user preference:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveUserPreference:', error);
    return false;
  }
};

export const getUserPreferences = async (context: AgentContext): Promise<UserPreference[]> => {
  try {
    const { data, error } = await supabase
      .from('chatbox_user_preferences')
      .select('*')
      .eq('user_id', context.userId)
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('Error getting user preferences:', error);
      return [];
    }

    return (data || []).map((pref: any) => ({
      preference_type: pref.preference_type,
      preference_value: pref.preference_value,
      confidence_score: pref.confidence_score,
      learned_from: pref.learned_from,
    }));
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return [];
  }
};

// Apprentissage explicite : l'utilisateur exprime directement une préférence
export const learnExplicitPreference = async (
  context: AgentContext,
  type: string,
  value: any
): Promise<void> => {
  await saveUserPreference(context, {
    preference_type: type,
    preference_value: value,
    confidence_score: 1.0, // Haute confiance pour préférences explicites
    learned_from: 'explicit',
  });
};

// Apprentissage implicite : détection de patterns dans les actions
export const learnImplicitPreference = async (
  context: AgentContext,
  type: string,
  value: any,
  confidence: number = 0.7
): Promise<void> => {
  await saveUserPreference(context, {
    preference_type: type,
    preference_value: value,
    confidence_score: confidence,
    learned_from: 'implicit',
  });
};

// ============================================
// GESTION DES PATTERNS COMPORTEMENTAUX
// ============================================

export const saveBehaviorPattern = async (
  context: AgentContext,
  pattern: BehaviorPattern
): Promise<boolean> => {
  try {
    // Vérifier si le pattern existe déjà
    const { data: existing } = await supabase
      .from('chatbox_behavior_patterns')
      .select('*')
      .eq('user_id', context.userId)
      .eq('pattern_type', pattern.pattern_type)
      .maybeSingle();

    if (existing) {
      // Mettre à jour la fréquence
      const { error } = await supabase
        .from('chatbox_behavior_patterns')
        .update({
          pattern_data: pattern.pattern_data,
          frequency: existing.frequency + 1,
          last_observed: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating behavior pattern:', error);
        return false;
      }
    } else {
      // Créer un nouveau pattern
      const { error } = await supabase
        .from('chatbox_behavior_patterns')
        .insert({
          user_id: context.userId,
          pattern_type: pattern.pattern_type,
          pattern_data: pattern.pattern_data,
          frequency: 1,
        });

      if (error) {
        console.error('Error saving behavior pattern:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in saveBehaviorPattern:', error);
    return false;
  }
};

export const getBehaviorPatterns = async (
  context: AgentContext,
  patternType?: BehaviorPattern['pattern_type']
): Promise<BehaviorPattern[]> => {
  try {
    let query = supabase
      .from('chatbox_behavior_patterns')
      .select('*')
      .eq('user_id', context.userId)
      .order('frequency', { ascending: false });

    if (patternType) {
      query = query.eq('pattern_type', patternType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting behavior patterns:', error);
      return [];
    }

    return (data || []).map((pattern: any) => ({
      pattern_type: pattern.pattern_type,
      pattern_data: pattern.pattern_data,
      frequency: pattern.frequency,
      last_observed: new Date(pattern.last_observed),
    }));
  } catch (error) {
    console.error('Error in getBehaviorPatterns:', error);
    return [];
  }
};

// Détecter un pattern de recherche
export const detectSearchPattern = async (
  context: AgentContext,
  searchQuery: string,
  filters: any
): Promise<void> => {
  const patterns: any = {};

  if (filters.category && filters.category !== 'all') {
    patterns.preferred_category = filters.category;
  }
  if (filters.location) {
    patterns.preferred_location = filters.location;
  }
  if (filters.type && filters.type !== 'all') {
    patterns.preferred_type = filters.type;
  }
  if (searchQuery) {
    patterns.common_keywords = searchQuery.toLowerCase();
  }

  if (Object.keys(patterns).length > 0) {
    await saveBehaviorPattern(context, {
      pattern_type: 'search_pattern',
      pattern_data: patterns,
      frequency: 1,
      last_observed: new Date(),
    });

    // Apprendre les préférences implicites
    if (patterns.preferred_category) {
      await learnImplicitPreference(context, 'job_category', patterns.preferred_category, 0.6);
    }
    if (patterns.preferred_location) {
      await learnImplicitPreference(context, 'location', patterns.preferred_location, 0.6);
    }
    if (patterns.preferred_type) {
      await learnImplicitPreference(context, 'job_type', patterns.preferred_type, 0.6);
    }
  }
};

// Détecter un pattern de candidature
export const detectApplicationPattern = async (
  context: AgentContext,
  jobCategory: string,
  jobType: string
): Promise<void> => {
  await saveBehaviorPattern(context, {
    pattern_type: 'application_pattern',
    pattern_data: {
      category: jobCategory,
      type: jobType,
    },
    frequency: 1,
    last_observed: new Date(),
  });
};
