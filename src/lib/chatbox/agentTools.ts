// Tools/Actions que l'agent IA peut exécuter réellement
import { AgentTool, AgentContext } from './types';
import {
  getJobOffers,
  getJobOfferById,
  createApplication,
  getCandidateApplications,
  getCompanyApplications,
  addFavoriteJob,
  removeFavoriteJob,
  getFavoriteJobs,
  getCandidateProfile,
  getCompanyProfile,
  getMessages,
  createMessage,
  getCandidateDecisionDNA,
  getCandidateStats,
  getCompanyJobOffers,
} from '@/lib/supabase';
import { JobOffer } from '@/types';

// Tool: Rechercher des offres d'emploi
const searchJobOffersTool: AgentTool = {
  name: 'searchJobOffers',
  description: 'Recherche réelle d\'offres d\'emploi dans la base de données avec filtres (recherche textuelle, localisation, type de contrat, catégorie). Retourne une liste d\'offres correspondantes.',
  parameters: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Terme de recherche (métier, compétences, entreprise)',
      },
      location: {
        type: 'string',
        description: 'Localisation (ville, région, télétravail)',
      },
      type: {
        type: 'string',
        description: 'Type de contrat',
        enum: ['all', 'full-time', 'part-time', 'contract', 'internship'],
      },
      category: {
        type: 'string',
        description: 'Catégorie d\'emploi',
        enum: ['all', 'Développement', 'Design', 'Management', 'Marketing'],
      },
    },
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const filters: any = {};
      if (params.search) filters.search = params.search;
      if (params.location) filters.location = params.location;
      if (params.type && params.type !== 'all') filters.type = params.type;
      if (params.category && params.category !== 'all') filters.category = params.category;

      const jobs = await getJobOffers(filters);
      return {
        success: true,
        count: jobs.length,
        jobs: jobs.slice(0, 20).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Entreprise anonyme',
          location: job.location,
          type: job.type,
          category: job.category,
          salary: job.salary ? `${job.salary.min}-${job.salary.max} ${job.salary.currency}` : null,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir les détails d'une offre
const getJobOfferDetailsTool: AgentTool = {
  name: 'getJobOfferDetails',
  description: 'Récupère les détails complets d\'une offre d\'emploi spécifique (description, missions, avantages, compétences requises, etc.)',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const job = await getJobOfferById(params.jobId);
      if (!job) {
        return { success: false, error: 'Offre non trouvée' };
      }
      return {
        success: true,
        job: {
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Entreprise anonyme',
          description: job.description,
          location: job.location,
          type: job.type,
          category: job.category,
          salary: job.salary,
          requirements: job.requirements,
          missions: job.missions,
          benefits: job.benefits,
          whoWeAre: job.whoWeAre,
          whatYouWillLive: job.whatYouWillLive,
          whatWeWillLove: job.whatWeWillLove,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Lister les candidatures de l'utilisateur
const getUserApplicationsTool: AgentTool = {
  name: 'getUserApplications',
  description: 'Récupère toutes les candidatures de l\'utilisateur avec leurs statuts (pending, reviewed, accepted, rejected)',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole === 'candidate' && context.candidateId) {
        const applications = await getCandidateApplications(context.candidateId);
        return {
          success: true,
          count: applications.length,
          applications: applications.map((app: any) => ({
            id: app.id,
            jobTitle: app.job_offers?.title || 'Offre supprimée',
            company: app.job_offers?.companies?.name || 'Entreprise anonyme',
            status: app.status,
            createdAt: app.created_at,
          })),
        };
      } else if (context.userRole === 'company' && context.companyId) {
        const applications = await getCompanyApplications(context.companyId);
        return {
          success: true,
          count: applications.length,
          applications: applications.map((app: any) => ({
            id: app.id,
            jobTitle: app.job_offers?.title || 'Offre supprimée',
            candidateId: app.candidate_id,
            status: app.status,
            createdAt: app.created_at,
          })),
        };
      }
      return { success: false, error: 'Utilisateur non identifié' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Postuler à une offre
const createApplicationTool: AgentTool = {
  name: 'createApplication',
  description: 'Postule réellement à une offre d\'emploi (crée une candidature dans la base de données)',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
      skills: {
        type: 'array',
        description: 'Liste des compétences (optionnel)',
        items: { type: 'string' },
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate' || !context.candidateId) {
        return { success: false, error: 'Seuls les candidats peuvent postuler' };
      }
      const application = await createApplication(params.jobId, context.candidateId, params.skills);
      if (application) {
        return {
          success: true,
          applicationId: application.id,
          message: 'Candidature créée avec succès',
        };
      }
      return { success: false, error: 'Échec de la création de la candidature' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir les favoris
const getFavoriteJobsTool: AgentTool = {
  name: 'getFavoriteJobs',
  description: 'Récupère toutes les offres d\'emploi sauvegardées en favoris par l\'utilisateur',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate' || !context.candidateId) {
        return { success: false, error: 'Seuls les candidats ont des favoris' };
      }
      const favorites = await getFavoriteJobs(context.candidateId);
      return {
        success: true,
        count: favorites.length,
        favorites: favorites.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Entreprise anonyme',
          location: job.location,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Ajouter un favori
const addFavoriteJobTool: AgentTool = {
  name: 'addFavoriteJob',
  description: 'Ajoute une offre d\'emploi aux favoris de l\'utilisateur',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate' || !context.candidateId) {
        return { success: false, error: 'Seuls les candidats peuvent ajouter des favoris' };
      }
      const success = await addFavoriteJob(context.candidateId, params.jobId);
      return {
        success,
        message: success ? 'Favori ajouté avec succès' : 'Échec de l\'ajout du favori',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Retirer un favori
const removeFavoriteJobTool: AgentTool = {
  name: 'removeFavoriteJob',
  description: 'Retire une offre d\'emploi des favoris de l\'utilisateur',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate' || !context.candidateId) {
        return { success: false, error: 'Seuls les candidats peuvent retirer des favoris' };
      }
      const success = await removeFavoriteJob(context.candidateId, params.jobId);
      return {
        success,
        message: success ? 'Favori retiré avec succès' : 'Échec du retrait du favori',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir le profil utilisateur
const getUserProfileTool: AgentTool = {
  name: 'getUserProfile',
  description: 'Récupère le profil complet de l\'utilisateur (CV, compétences, expérience, localisation, etc.)',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole === 'candidate' && context.candidateId) {
        const profile = await getCandidateProfile(context.candidateId);
        if (!profile) {
          return { success: false, error: 'Profil non trouvé' };
        }
        return {
          success: true,
          profile: {
            email: profile.email,
            skills: profile.skills || [],
            experience: profile.experience,
            education: profile.education,
            location: profile.location,
            bio: profile.bio,
            certified: profile.certified,
            verificationStatus: profile.verificationStatus,
          },
        };
      } else if (context.userRole === 'company' && context.companyId) {
        const profile = await getCompanyProfile(context.companyId);
        if (!profile) {
          return { success: false, error: 'Profil non trouvé' };
        }
        return {
          success: true,
          profile: {
            name: profile.name,
            description: profile.description,
            website: profile.website,
            industry: profile.industry,
            size: profile.size,
          },
        };
      }
      return { success: false, error: 'Utilisateur non identifié' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir les messages
const getUserMessagesTool: AgentTool = {
  name: 'getUserMessages',
  description: 'Récupère les messages de l\'utilisateur (conversations avec entreprises/candidats)',
  parameters: {
    type: 'object',
    properties: {
      applicationId: {
        type: 'string',
        description: 'ID de la candidature (optionnel, pour filtrer par candidature)',
      },
    },
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      // Pour simplifier, on récupère les conversations
      // L'implémentation complète nécessiterait getConversations
      return {
        success: true,
        message: 'Utilisez getConversations pour obtenir la liste complète des conversations',
        note: 'Cette fonction nécessite une implémentation complète de getConversations',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Envoyer un message
const sendMessageTool: AgentTool = {
  name: 'sendMessage',
  description: 'Envoie un message réel à une entreprise ou un candidat dans le cadre d\'une candidature',
  parameters: {
    type: 'object',
    properties: {
      applicationId: {
        type: 'string',
        description: 'ID de la candidature',
      },
      content: {
        type: 'string',
        description: 'Contenu du message',
      },
    },
    required: ['applicationId', 'content'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const message = await createMessage(
        params.applicationId,
        context.userId,
        params.content
      );
      if (message) {
        return {
          success: true,
          messageId: message.id,
          message: 'Message envoyé avec succès',
        };
      }
      return { success: false, error: 'Échec de l\'envoi du message' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir le Decision DNA
const getDecisionDNATool: AgentTool = {
  name: 'getDecisionDNA',
  description: 'Récupère le profil Decision DNA d\'une candidature (trajectoires de décision du candidat)',
  parameters: {
    type: 'object',
    properties: {
      applicationId: {
        type: 'string',
        description: 'ID de la candidature',
      },
    },
    required: ['applicationId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const decisionDNA = await getCandidateDecisionDNA(params.applicationId);
      if (!decisionDNA) {
        return { success: false, error: 'Decision DNA non trouvé pour cette candidature' };
      }
      return {
        success: true,
        decisionDNA: decisionDNA.decisionDNA,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir les statistiques utilisateur
const getUserStatsTool: AgentTool = {
  name: 'getUserStats',
  description: 'Récupère les statistiques de l\'utilisateur (nombre de candidatures, taux de réponse, etc.)',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole === 'candidate' && context.candidateId) {
        const stats = await getCandidateStats(context.candidateId);
        return {
          success: true,
          stats,
        };
      }
      return { success: false, error: 'Statistiques disponibles uniquement pour les candidats' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Liste de tous les tools disponibles
export const agentTools: AgentTool[] = [
  searchJobOffersTool,
  getJobOfferDetailsTool,
  getUserApplicationsTool,
  createApplicationTool,
  getFavoriteJobsTool,
  addFavoriteJobTool,
  removeFavoriteJobTool,
  getUserProfileTool,
  getUserMessagesTool,
  sendMessageTool,
  getDecisionDNATool,
  getUserStatsTool,
];

// Fonction helper pour obtenir un tool par son nom
export const getToolByName = (name: string): AgentTool | undefined => {
  return agentTools.find(tool => tool.name === name);
};

// Convertir les tools au format Groq API
export const toolsToGroqFormat = () => {
  return agentTools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }));
};
