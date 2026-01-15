// Service d'accès aux données utilisateur pour l'agent
import { AgentContext } from './types';
import {
  getCandidateProfile,
  getCompanyProfile,
  getCandidateApplications,
  getCompanyApplications,
  getMessages,
  getCandidateDecisionDNA,
  getCandidateStats,
} from '@/lib/supabase';

// Accès au CV/Profil utilisateur (lecture seule, temps réel)
export const getUserCV = async (context: AgentContext) => {
  if (context.userRole === 'candidate' && context.candidateId) {
    const profile = await getCandidateProfile(context.candidateId);
    return {
      success: true,
      access: 'read_only',
      realtime: true,
      data: profile ? {
        skills: profile.skills || [],
        experience: profile.experience,
        education: profile.education,
        bio: profile.bio,
        location: profile.location,
      } : null,
    };
  }
  return { success: false, error: 'CV non disponible' };
};

// Accès aux informations de profil (lecture seule, temps réel)
export const getUserProfileInfo = async (context: AgentContext) => {
  if (context.userRole === 'candidate' && context.candidateId) {
    const profile = await getCandidateProfile(context.candidateId);
    return {
      success: true,
      access: 'read_only',
      realtime: true,
      data: profile,
    };
  } else if (context.userRole === 'company' && context.companyId) {
    const profile = await getCompanyProfile(context.companyId);
    return {
      success: true,
      access: 'read_only',
      realtime: true,
      data: profile,
    };
  }
  return { success: false, error: 'Profil non disponible' };
};

// Accès à l'historique de candidatures (lecture seule, temps réel)
export const getUserApplicationsHistory = async (context: AgentContext) => {
  try {
    if (context.userRole === 'candidate' && context.candidateId) {
      const applications = await getCandidateApplications(context.candidateId);
      return {
        success: true,
        access: 'read_only',
        realtime: true,
        data: applications,
      };
    } else if (context.userRole === 'company' && context.companyId) {
      const applications = await getCompanyApplications(context.companyId);
      return {
        success: true,
        access: 'read_only',
        realtime: true,
        data: applications,
      };
    }
    return { success: false, error: 'Historique non disponible' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Accès aux messages (lecture seule, temps réel)
export const getUserMessagesHistory = async (context: AgentContext, applicationId?: string) => {
  try {
    // Note: getMessages nécessite un applicationId
    // Pour une implémentation complète, il faudrait getConversations
    return {
      success: true,
      access: 'read_only',
      realtime: true,
      note: 'Utilisez getMessages avec un applicationId spécifique',
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Accès à la localisation (lecture seule, temps réel)
export const getUserLocation = async (context: AgentContext) => {
  if (context.userRole === 'candidate' && context.candidateId) {
    const profile = await getCandidateProfile(context.candidateId);
    return {
      success: true,
      access: 'read_only',
      realtime: true,
      data: profile?.location || null,
    };
  }
  return { success: false, error: 'Localisation non disponible' };
};

// Accès aux compétences (lecture seule, temps réel)
export const getUserSkills = async (context: AgentContext) => {
  if (context.userRole === 'candidate' && context.candidateId) {
    const profile = await getCandidateProfile(context.candidateId);
    return {
      success: true,
      access: 'read_only',
      realtime: true,
      data: profile?.skills || [],
    };
  }
  return { success: false, error: 'Compétences non disponibles' };
};

// Accès au Decision DNA (lecture seule, temps réel)
export const getUserDecisionDNA = async (context: AgentContext, applicationId: string) => {
  try {
    const decisionDNA = await getCandidateDecisionDNA(applicationId);
    return {
      success: true,
      access: 'read_only',
      realtime: true,
      data: decisionDNA,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Accès aux statistiques (lecture seule, temps réel)
export const getUserStatistics = async (context: AgentContext) => {
  if (context.userRole === 'candidate' && context.candidateId) {
    const stats = await getCandidateStats(context.candidateId);
    return {
      success: true,
      access: 'read_only',
      realtime: true,
      data: stats,
    };
  }
  return { success: false, error: 'Statistiques non disponibles' };
};

// Résumé de tous les accès disponibles
export const getDataAccessSummary = (context: AgentContext) => {
  return {
    cv: { available: context.userRole === 'candidate', access: 'read_only', realtime: true },
    profile: { available: true, access: 'read_only', realtime: true },
    navigation_history: { available: false, access: 'none', realtime: false },
    applications_history: { available: true, access: 'read_only', realtime: true },
    messages: { available: true, access: 'read_only', realtime: true },
    location: { available: context.userRole === 'candidate', access: 'read_only', realtime: true },
    skills: { available: context.userRole === 'candidate', access: 'read_only', realtime: true },
    decision_dna: { available: context.userRole === 'candidate', access: 'read_only', realtime: true },
    statistics: { available: context.userRole === 'candidate', access: 'read_only', realtime: true },
  };
};
